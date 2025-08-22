import { useAtomValue } from "jotai";
import { transactionHashAtom } from "../atoms/api";
import { useCallback } from "react";
import { RPC_URL } from "../constants";
import { useWSL } from "./useWSL";

export const useSynthesizer = () => {
  const transactionHash = useAtomValue(transactionHashAtom);
  const { wslInfo, isWSLSupported } = useWSL();

  // Helper function to check if we should use WSL for synthesizer execution
  const shouldUseWSL = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we're on Windows platform first
      if (typeof window !== "undefined" && window.env?.getEnvironmentInfo) {
        const envInfo = await window.env.getEnvironmentInfo();

        // Only use WSL if we're on Windows and WSL is available
        if (envInfo.platform === "win32") {
          console.log(
            "🔍 Synthesizer: Platform is Windows, checking WSL availability..."
          );
          const shouldUse = isWSLSupported && wslInfo?.isAvailable === true;
          console.log(
            `🔍 Synthesizer WSL decision: ${shouldUse ? "Use WSL" : "Don't use WSL"}`,
            {
              isWSLSupported,
              wslInfoAvailable: wslInfo?.isAvailable,
              wslInfo,
            }
          );
          return shouldUse;
        } else {
          console.log(
            `🔍 Synthesizer: Platform is ${envInfo.platform}, not using WSL`
          );
          return false;
        }
      }

      console.log(
        "🔍 Synthesizer: Environment info not available, not using WSL"
      );
      return false;
    } catch (error) {
      console.error(
        "🔍 Synthesizer: Error checking platform for WSL decision:",
        error
      );
      return false;
    }
  }, [isWSLSupported, wslInfo]);

  const parseTONTransfer = useCallback(async () => {
    try {
      console.log("parseTONTransfer ->", { transactionHash });

      // Check if we need WSL for Windows
      const useWSL = await shouldUseWSL();

      // Check if we're on Windows and provide guidance
      if (typeof window !== "undefined" && window.env?.getEnvironmentInfo) {
        try {
          const envInfo = await window.env.getEnvironmentInfo();
          if (envInfo.platform === "win32") {
            if (!isWSLSupported) {
              console.warn(
                "🔍 Synthesizer: WSL is not available on Windows. " +
                  "This may cause issues with Linux binary execution. " +
                  "Consider installing WSL for better compatibility."
              );
            } else {
              console.log(
                "🔍 Synthesizer: WSL is available and will be used for execution."
              );
            }
          }
        } catch (envError) {
          console.warn(
            "🔍 Synthesizer: Could not check environment info:",
            envError
          );
        }
      }

      console.log("🔍 Synthesizer: Executing parse command...");
      console.log(
        `🔍 Synthesizer: Using ${useWSL ? "WSL" : "native"} execution`
      );

      let result;

      if (useWSL) {
        // Use WSL execution through system command
        console.log("🔍 Synthesizer: Using WSL for execution on Windows");

        try {
          // Execute synthesizer via WSL using the correct synthesizer path
          result = await window.binaryService.executeSystemCommand([
            "bash",
            "-c",
            `cd src/binaries/synthesizer && ./synthesizer-final parse -r ${RPC_URL} -t ${transactionHash} --output-dir ../backend/resource/synthesizer/outputs`,
          ]);
        } catch (wslError) {
          console.error("🔍 Synthesizer: WSL execution failed:", wslError);
          throw new Error(
            `WSL execution failed: ${wslError.message}. ` +
              "Please ensure WSL is properly installed and configured, or try installing a Linux distribution from the Microsoft Store."
          );
        }
      } else {
        // Use direct execution for macOS/Linux, or fallback for Windows
        console.log(
          "🔍 Synthesizer: Using direct execution (non-Windows or WSL not available)"
        );

        try {
          result = await window.binaryService.executeDirectCommand([
            "parse",
            "-r",
            RPC_URL,
            "-t",
            transactionHash,
            "--output-dir",
            "src/binaries/backend/resource/synthesizer/outputs",
          ]);
        } catch (directError) {
          console.log(
            "🔍 Synthesizer: Direct execution failed:",
            directError.message
          );

          // Check if we're on Windows without WSL
          if (typeof window !== "undefined" && window.env?.getEnvironmentInfo) {
            try {
              const envInfo = await window.env.getEnvironmentInfo();
              if (envInfo.platform === "win32") {
                throw new Error(
                  "Cannot execute Linux binaries on Windows without WSL. " +
                    "Please install WSL using 'wsl --install' in PowerShell as administrator, " +
                    "or install a Linux distribution from the Microsoft Store."
                );
              }
            } catch (envError) {
              console.warn("Could not determine platform:", envError);
            }
          }

          // Fallback to system command for non-Windows platforms
          console.log("🔍 Synthesizer: Trying system command fallback");
          result = await window.binaryService.executeSystemCommand([
            "bash",
            "-c",
            `cd src/binaries/synthesizer && ./synthesizer-final parse -r ${RPC_URL} -t ${transactionHash} --output-dir ../backend/resource/synthesizer/outputs`,
          ]);
        }
      }

      console.log("🔍 Synthesizer: Parse command completed:", result);
      return { success: true, result };
    } catch (error) {
      console.error("🔍 Synthesizer: Failed to execute binary command:", error);
      return {
        success: false,
        error: error.message || "An unknown error occurred",
      };
    }
  }, [transactionHash, shouldUseWSL, isWSLSupported]);

  return { parseTONTransfer };
};

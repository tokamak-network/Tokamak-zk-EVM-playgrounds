import { useAtomValue } from "jotai";
import { transactionHashAtom } from "../atoms/api";
import { useCallback } from "react";
import { RPC_URL } from "../constants";
import { useWSL } from "./useWSL";

export const useSynthesizer = () => {
  const transactionHash = useAtomValue(transactionHashAtom);
  const { wslInfo, isWSLSupported } = useWSL();

  // Helper function to get the correct paths for packaged vs development environment
  const getPaths = useCallback(async () => {
    try {
      // Check if we're in a packaged environment
      const isPackaged =
        typeof window !== "undefined" && window.env?.isPackaged
          ? await window.env.isPackaged()
          : false;

      console.log("🔍 Synthesizer: Environment check:", { isPackaged });

      // Platform-specific output directory: Windows uses original paths, macOS/Linux uses /tmp
      const isWindows = window.navigator.platform.toLowerCase().includes("win");
      const outputDir = isWindows
        ? "src/binaries/resource/synthesizer/outputs"
        : "/tmp/tokamak-zk-evm/synthesizer/outputs";

      if (isPackaged) {
        return {
          synthesizerDir: "resources/binaries",
          outputDir,
          synthesizerScript: "2_run-synthesizer.sh",
        };
      } else {
        return {
          synthesizerDir: "src/binaries",
          outputDir,
          synthesizerScript: "2_run-synthesizer.sh",
        };
      }
    } catch (error) {
      console.warn(
        "🔍 Synthesizer: Failed to check packaged status, using development paths:",
        error
      );
      // Fallback to development paths
      const isWindows = window.navigator.platform.toLowerCase().includes("win");
      const outputDir = isWindows
        ? "src/binaries/resource/synthesizer/outputs"
        : "/tmp/tokamak-zk-evm/synthesizer/outputs";

      return {
        synthesizerDir: "src/binaries",
        outputDir,
        synthesizerScript: "2_run-synthesizer.sh",
      };
    }
  }, []);

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
          // Execute synthesizer script via WSL
          const paths = await getPaths();
          const scriptPath = `${paths.synthesizerDir}/${paths.synthesizerScript}`;
          result = await window.binaryService.executeSystemCommand([
            "bash",
            scriptPath,
            transactionHash,
            RPC_URL,
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
          console.log("🔍 Synthesizer: Getting paths...");
          const paths = await getPaths();
          console.log("🔍 Synthesizer: Paths obtained:", paths);

          const scriptPath = `${paths.synthesizerDir}/${paths.synthesizerScript}`;
          console.log("🔍 Synthesizer: Script path:", scriptPath);
          console.log("🔍 Synthesizer: Transaction hash:", transactionHash);

          console.log("🔍 Synthesizer: About to execute system command...");
          console.log(
            "🔍 Synthesizer: Checking window.binaryService:",
            !!window.binaryService
          );
          console.log(
            "🔍 Synthesizer: Checking executeSystemCommand:",
            !!window.binaryService?.executeSystemCommand
          );

          const commandArray = ["bash", scriptPath, transactionHash, RPC_URL];
          console.log("🔍 Synthesizer: Command array:", commandArray);

          try {
            console.log("🔍 Synthesizer: Calling executeSystemCommand...");

            // Add timeout to prevent infinite hanging
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(
                  new Error("executeSystemCommand timed out after 30 seconds")
                );
              }, 30000);
            });

            const executePromise =
              window.binaryService.executeSystemCommand(commandArray);

            result = await Promise.race([executePromise, timeoutPromise]);
            console.log("🔍 Synthesizer: System command completed:", result);
          } catch (executeError) {
            console.error(
              "🔍 Synthesizer: executeSystemCommand failed:",
              executeError
            );
            throw executeError;
          }
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
          const paths = await getPaths();
          const scriptPath = `${paths.synthesizerDir}/${paths.synthesizerScript}`;
          result = await window.binaryService.executeSystemCommand([
            "bash",
            scriptPath,
            transactionHash,
            RPC_URL,
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
  }, [transactionHash, shouldUseWSL, isWSLSupported, getPaths]);

  return { parseTONTransfer };
};

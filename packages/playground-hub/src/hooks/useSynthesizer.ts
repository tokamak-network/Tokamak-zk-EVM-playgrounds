import { useAtomValue } from "jotai";
import { useBinary } from "./useBinary";
import { transactionHashAtom } from "../atoms/api";
import { useCallback } from "react";
import { RPC_URL } from "../constants";

export const useSynthesizer = () => {
  const transactionHash = useAtomValue(transactionHashAtom);
  const { executeCommand, binaryStatus, startBinary, isBinaryRunning } =
    useBinary();

  const parseTONTransfer = useCallback(async () => {
    try {
      console.log("parseTONTransfer ->", { transactionHash });

      // Check if binary is available and running
      if (!binaryStatus.isInstalled) {
        throw new Error("Synthesizer binary is not installed");
      }

      if (!binaryStatus.isExecutable) {
        throw new Error("Synthesizer binary is not executable");
      }

      // This binary is a CLI tool, not a long-running service
      // We'll execute it directly with the parse command
      console.log("Executing synthesizer parse command...");

      // Use direct binary execution for CLI commands
      const result = await window.binaryService.executeDirectCommand([
        "parse",
        "-r",
        RPC_URL,
        "-t",
        transactionHash,
        "--output-dir",
        "src/binaries/backend/resource/synthesizer/outputs",
      ]);

      console.log("result", result);
      return result;
    } catch (error) {
      console.error("바이너리 명령 실행 실패:", error);
      throw error;
    }
  }, [
    transactionHash,
    executeCommand,
    binaryStatus,
    startBinary,
    isBinaryRunning,
  ]);

  return { parseTONTransfer };
};

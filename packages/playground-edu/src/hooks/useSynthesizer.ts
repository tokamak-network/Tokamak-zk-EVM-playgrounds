import { useAtomValue } from "jotai";
import { transactionHashAtom } from "../atoms/api";
import { useCallback } from "react";
import { RPC_URL } from "../constants";

export const useSynthesizer = () => {
  const transactionHash = useAtomValue(transactionHashAtom);

  const parseTONTransfer = useCallback(async () => {
    try {
      console.log("parseTONTransfer ->", { transactionHash });

      console.log("Executing synthesizer parse command...");

      // Execute synthesizer directly
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
      console.error("Failed to execute binary command:", error);
      throw error;
    }
  }, [transactionHash]);

  return { parseTONTransfer };
};

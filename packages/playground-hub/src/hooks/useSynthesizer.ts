import { useAtomValue } from "jotai";
import { useDocker } from "./useDocker";
import { transactionBytecodeAtom } from "../atoms/api";
import { useCallback } from "react";

export const useSynthesizer = () => {
  const transactionBytecode = useAtomValue(transactionBytecodeAtom);
  const { executeCommand } = useDocker();

  const parseTONTransfer = useCallback(
    async (containerId: string) => {
      try {
        console.log("parseTONTransfer ->", { transactionBytecode });

        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd /app/frontend/synthesizer/examples/erc20 && 
        tsx ton-transfer.ts ${transactionBytecode.bytecode} ${transactionBytecode.from}`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.error("도커 명령 실행 실패:", error);
        return null;
      }
    },
    [transactionBytecode]
  );

  return { parseTONTransfer };
};

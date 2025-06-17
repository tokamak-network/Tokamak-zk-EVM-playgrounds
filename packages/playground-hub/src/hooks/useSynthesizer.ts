import { useAtomValue } from "jotai";
import { useDocker } from "./useDocker";
import { transactionHashAtom } from "../atoms/api";
import { useCallback } from "react";
import { getEnvVars } from "../constants";

export const useSynthesizer = () => {
  const transactionHash = useAtomValue(transactionHashAtom);
  const { executeCommand } = useDocker();

  const parseTONTransfer = useCallback(
    async (containerId: string) => {
      try {
        console.log("parseTONTransfer ->", { transactionHash });

        const RPC_URL = await getEnvVars();
        console.log("RPC_URL", RPC_URL);

        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd packages/frontend/synthesizer/examples/transaction && 
        tsx index.ts ${RPC_URL} ${transactionHash}`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.error("도커 명령 실행 실패:", error);
        throw error;
      }
    },
    [transactionHash]
  );

  return { parseTONTransfer };
};

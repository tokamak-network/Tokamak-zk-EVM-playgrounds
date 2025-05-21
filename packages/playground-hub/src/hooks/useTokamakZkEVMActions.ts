import { useCallback } from "react";
import { useDocker } from "./useDocker";
import { useSynthesizer } from "./useSynthesizer";
import { useProve } from "./useBackend";
import { useAtom, useSetAtom } from "jotai";
import {
  provingIsDoneAtom,
  provingResultAtom,
} from "../atoms/pipelineAnimation";

export function useTokamakZkEVMActions() {
  const { runContainer, currentDockerContainer } = useDocker();
  const { parseTONTransfer } = useSynthesizer();
  const { prove } = useProve();
  const [provingIsDone, setProvingIsDone] = useAtom(provingIsDoneAtom);
  const [provingResult, setProvingResult] = useAtom(provingResultAtom);

  //blue cloud action
  const setupEvmSpec = useCallback(() => {
    runContainer("tokamak-zk-evm-demo");
  }, [runContainer]);

  const runSynthesizer = useCallback(() => {
    if (currentDockerContainer?.id) {
      return parseTONTransfer(currentDockerContainer?.id);
    }
  }, [parseTONTransfer, currentDockerContainer]);

  const proveTransaction = useCallback(async () => {
    if (currentDockerContainer?.id) {
      const result = await prove(currentDockerContainer?.id);
      console.log("result", result);

      // result가 여러 줄의 문자열이라면, 마지막 줄을 추출
      const lines = result.trim().split("\n");
      const lastLine = lines[lines.length - 1].trim();

      // 마지막 줄이 "Verification: true" 또는 "Verification: false"인지 확인
      if (lastLine.startsWith("Verification:")) {
        setProvingIsDone(true);
        const provingResult = lastLine.split(":")[1].trim();
        setProvingResult(provingResult === "true");
      }
    }
  }, [prove, currentDockerContainer]);

  return {
    setupEvmSpec,
    runSynthesizer,
    proveTransaction,
    provingIsDone,
    provingResult,
  };
}

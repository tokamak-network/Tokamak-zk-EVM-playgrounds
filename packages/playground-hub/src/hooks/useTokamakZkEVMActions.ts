import { useCallback } from "react";
import { useDocker } from "./useDocker";
import { useSynthesizer } from "./useSynthesizer";
import { useProve } from "./useBackend";

export function useTokamakZkEVMActions() {
  const { runContainer, currentDockerContainer } = useDocker();
  const { parseTONTransfer } = useSynthesizer();
  const { prove } = useProve();

  //blue cloud action
  const setupEvmSpec = useCallback(() => {
    runContainer("tokamak-zk-evm-demo");
  }, [runContainer]);

  const runSynthesizer = useCallback(() => {
    if (currentDockerContainer?.id) {
      return parseTONTransfer(currentDockerContainer?.id);
    }
  }, [parseTONTransfer, currentDockerContainer]);

  const proveTransaction = useCallback(() => {
    if (currentDockerContainer?.id) {
      return prove(currentDockerContainer?.id);
    }
  }, [prove, currentDockerContainer]);

  return { setupEvmSpec, runSynthesizer, proveTransaction };
}

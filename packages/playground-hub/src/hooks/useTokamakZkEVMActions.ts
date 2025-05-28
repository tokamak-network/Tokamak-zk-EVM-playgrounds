import { useCallback } from "react";
import { useDocker } from "./useDocker";
import { useSynthesizer } from "./useSynthesizer";
import { useProve } from "./useBackend";
import { useAtom } from "jotai";
import {
  provingIsDoneAtom,
  provingResultAtom,
} from "../atoms/pipelineAnimation";
import { usePipelineAnimation } from "./usePipelineAnimation";
import { useModals } from "./useModals";

export enum TokamakActionType {
  SetupEvmSpec = "SETUP_EVM_SPEC",
  RunSynthesizer = "RUN_SYNTHESIZER",
  ProveTransaction = "PROVE_TRANSACTION",
}

export function useTokamakZkEVMActions() {
  const { runContainer, currentDockerContainer } = useDocker();
  const { parseTONTransfer } = useSynthesizer();
  const { prove } = useProve();
  const [provingIsDone, setProvingIsDone] = useAtom(provingIsDoneAtom);
  const [provingResult, setProvingResult] = useAtom(provingResultAtom);
  const { setPendingAnimation } = usePipelineAnimation();
  const { openModal } = useModals();
  const { updateActiveSection, resetAnimationHandler } = usePipelineAnimation();

  const executeTokamakAction = useCallback(
    async (actionType: TokamakActionType) => {
      try {
        switch (actionType) {
          case TokamakActionType.SetupEvmSpec:
            return await runContainer("tokamak-zk-evm-demo");

          case TokamakActionType.RunSynthesizer:
            console.log("currentDockerContainer", currentDockerContainer);
            if (currentDockerContainer?.ID) {
              console.log("go");
              return await parseTONTransfer(currentDockerContainer.ID);
            }
            return Promise.resolve(undefined);

          case TokamakActionType.ProveTransaction:
            if (currentDockerContainer?.ID) {
              setTimeout(() => {
                setPendingAnimation(true);
              }, 1000);

              try {
                const result = await prove(currentDockerContainer.ID);

                const lines = result.trim().split("\n");
                const lastLine = lines[lines.length - 1].trim();

                if (lastLine.startsWith("Verification:")) {
                  setProvingIsDone(true);
                  const provingResultValue = lastLine.split(":")[1].trim();
                  setProvingResult(provingResultValue === "true");
                  return {
                    success: true,
                    verificationResult: provingResultValue === "true",
                    rawResult: result,
                  };
                } else {
                  setProvingIsDone(true);
                  setProvingResult(false);
                  return {
                    success: false,
                    error: "Verification line not found",
                    rawResult: result,
                  };
                }
              } catch (error) {
                setProvingIsDone(true);
                setProvingResult(false);
                return {
                  success: false,
                  error: error.message || "An unknown error occurred",
                  rawResult: null,
                };
              } finally {
                setPendingAnimation(false);
              }
            } else {
              return Promise.resolve({
                success: false,
                error: "No current Docker container ID found",
              });
            }

          default:
            console.warn(
              `executeTokamakAction: Unknown action type "${actionType}"`
            );
            return Promise.resolve(undefined);
        }
      } catch (error) {
        setPendingAnimation(true);
        updateActiveSection("none");
        resetAnimationHandler();
        openModal("error");
        console.error(error);
        return Promise.resolve({
          success: false,
          error: error.message || "An unknown error occurred",
        });
      }
    },
    [
      runContainer,
      currentDockerContainer,
      parseTONTransfer,
      prove,
      setPendingAnimation,
      setProvingIsDone,
      setProvingResult,
    ]
  );

  const setupEvmSpec = useCallback(() => {
    return executeTokamakAction(TokamakActionType.SetupEvmSpec);
  }, [executeTokamakAction]);

  const runSynthesizer = useCallback(() => {
    return executeTokamakAction(TokamakActionType.RunSynthesizer);
  }, [executeTokamakAction]);

  const proveTransaction = useCallback(async () => {
    return executeTokamakAction(TokamakActionType.ProveTransaction);
  }, [executeTokamakAction]);

  return {
    executeTokamakAction,
    setupEvmSpec,
    runSynthesizer,
    proveTransaction,
    provingIsDone,
    provingResult,
  };
}

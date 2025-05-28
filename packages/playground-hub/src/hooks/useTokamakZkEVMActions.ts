import { useCallback } from "react";
import { useDocker } from "./useDocker";
import { useSynthesizer } from "./useSynthesizer";
import { useBackendCommand } from "./useBackend";
import { usePipelineAnimation } from "./usePipelineAnimation";
import { useModals } from "./useModals";
import {
  provingResultAtom,
  provingIsDoneAtom,
} from "../atoms/pipelineAnimation";
import { useAtom } from "jotai";

export enum TokamakActionType {
  SetupEvmSpec = "SETUP_EVM_SPEC",
  RunSynthesizer = "RUN_SYNTHESIZER",
  ProveTransaction = "PROVE_TRANSACTION",
  SetupTrustedSetup = "SETUP_TRUSTED_SETUP",
  PreProcess = "PRE_PROCESS",
  Verify = "VERIFY",
}

export function useTokamakZkEVMActions() {
  const [provingIsDone, setProvingIsDone] = useAtom(provingIsDoneAtom);
  const [provingResult, setProvingResult] = useAtom(provingResultAtom);
  const { runContainer, currentDockerContainer } = useDocker();
  const { parseTONTransfer } = useSynthesizer();
  const { setup, preProcess, prove, verify } = useBackendCommand();
  const { setPendingAnimation } = usePipelineAnimation();
  const { openModal } = useModals();
  const { updateActiveSection, resetAnimationHandler } = usePipelineAnimation();

  const executeTokamakAction = useCallback(
    async (actionType: TokamakActionType) => {
      try {
        switch (actionType) {
          case TokamakActionType.SetupEvmSpec:
            return await runContainer("tokamak-zk-evm-tontransfer");

          case TokamakActionType.RunSynthesizer:
            console.log("currentDockerContainer", currentDockerContainer);
            if (currentDockerContainer?.ID) {
              return await parseTONTransfer(currentDockerContainer.ID);
            }
            return Promise.resolve(undefined);

          case TokamakActionType.SetupTrustedSetup:
            if (currentDockerContainer?.ID) {
              return await setup(currentDockerContainer.ID);
            }
            return Promise.resolve(undefined);

          case TokamakActionType.PreProcess:
            if (currentDockerContainer?.ID) {
              return await preProcess(currentDockerContainer.ID);
            }
            return Promise.resolve(undefined);

          case TokamakActionType.ProveTransaction:
            if (currentDockerContainer?.ID) {
              return await prove(currentDockerContainer.ID);
            }
            return Promise.resolve(undefined);

          case TokamakActionType.Verify:
            if (currentDockerContainer?.ID) {
              setTimeout(() => {
                setPendingAnimation(true);
              }, 1000);

              try {
                const result = await verify(currentDockerContainer.ID);

                const lines = result.trim().split("\n");
                const lastLine = lines[lines.length - 1].trim();

                if (lastLine.startsWith("Verification result:")) {
                  setProvingIsDone(true);
                  const provingResultValue = lastLine.split(":")[1].trim();
                  const isTrue = provingResultValue === "true, true";
                  setProvingResult(isTrue);
                  return {
                    success: isTrue,
                    verificationResult: isTrue,
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
            }
            return Promise.resolve(undefined);

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

  const runProve = useCallback(async () => {
    return executeTokamakAction(TokamakActionType.ProveTransaction);
  }, [executeTokamakAction]);

  const runSetupTrustedSetup = useCallback(async () => {
    return executeTokamakAction(TokamakActionType.SetupTrustedSetup);
  }, [executeTokamakAction]);

  const runPreProcess = useCallback(async () => {
    return executeTokamakAction(TokamakActionType.PreProcess);
  }, [executeTokamakAction]);

  const runVerify = useCallback(async () => {
    return executeTokamakAction(TokamakActionType.Verify);
  }, [executeTokamakAction]);

  return {
    executeTokamakAction,
    setupEvmSpec,
    runSynthesizer,
    runProve,
    runSetupTrustedSetup,
    runPreProcess,
    runVerify,
    provingIsDone,
    provingResult,
  };
}

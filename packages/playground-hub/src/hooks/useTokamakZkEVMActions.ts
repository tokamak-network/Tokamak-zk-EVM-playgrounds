import { useCallback } from "react";
import { useBinary } from "./useBinary";
import { useSynthesizer } from "./useSynthesizer";
import { useBackendCommand } from "./useBackend";
import { useAtom, useSetAtom } from "jotai";
import { useResetStage } from "./useResetStage";
import { usePlaygroundStage } from "./usePlaygroundStage";
import { useCuda } from "./useCuda";
import { useBenchmark } from "./useBenchmark";
import {
  isErrorAtom,
  isFirstTimeAtom,
  showProcessResultModalAtom,
} from "../atoms/ui";

// CUDA API types are defined in render.d.ts

export enum TokamakActionType {
  InstallDependencies = "INSTALL_DEPENDENCIES",
  SetupEvmSpec = "SETUP_EVM_SPEC",
  RunSynthesizer = "RUN_SYNTHESIZER",
  ProveTransaction = "PROVE_TRANSACTION",
  SetupTrustedSetup = "SETUP_TRUSTED_SETUP",
  PreProcess = "PRE_PROCESS",
  Verify = "VERIFY",
  ExecuteAll = "EXECUTE_ALL",
}

export function useTokamakZkEVMActions() {
  const { startBinary, currentProcess, executeCommand, binaryStatus } =
    useBinary();
  const { parseTONTransfer } = useSynthesizer();
  const { initializeWhenCatchError } = useResetStage();
  const { setPlaygroundStageInProcess } = usePlaygroundStage();
  const { cudaStatus } = useCuda();
  const isCudaSupported = cudaStatus.isFullySupported;
  const {
    startProcessTiming,
    endProcessTiming,
    initializeBenchmarkSession,
    currentSession,
    globalBenchmarkSession,
  } = useBenchmark();
  const setIsError = useSetAtom(isErrorAtom);
  const [, setShowProcessResult] = useAtom(showProcessResultModalAtom);
  const [, setIsFirstTime] = useAtom(isFirstTimeAtom);

  const executeTokamakAction = useCallback(
    async (actionType: TokamakActionType): Promise<any> => {
      let hasError = false;
      try {
        setPlaygroundStageInProcess(true);
        setShowProcessResult(false);

        switch (actionType) {
          case TokamakActionType.InstallDependencies:
            console.log(
              "🔍 InstallDependencies: Starting installation process..."
            );

            try {
              console.log("🔍 InstallDependencies: Executing 1_install.sh...");
              const result = await window.binaryService.executeScriptWithSudo(
                "src/binaries/backend/1_install.sh"
              );

              console.log(
                "🔍 InstallDependencies: Installation completed successfully"
              );
              return result;
            } catch (error) {
              console.error("🔍 InstallDependencies: Error occurred:", error);
              throw error;
            }

          case TokamakActionType.SetupEvmSpec:
            try {
              // Start binary process
              console.log("🚀 Starting binary process");
              const process = await startBinary();

              if (!process?.pid) {
                throw new Error("Failed to start binary process");
              }

              return process;
            } catch (error) {
              console.error("❌ SetupEvmSpec process failed:", error);
              throw error;
            }

          case TokamakActionType.RunSynthesizer:
            try {
              console.log("🔍 RunSynthesizer: Starting synthesizer action...");
              const result = await parseTONTransfer();
              console.log("🔍 RunSynthesizer: Parse result:", result);
              return result;
            } catch (error) {
              console.error("🔍 RunSynthesizer: Error occurred:", error);
              hasError = true;
              throw error;
            }

          case TokamakActionType.SetupTrustedSetup:
            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              console.log("🔍 SetupTrustedSetup: Starting setup process...");

              try {
                console.log(
                  "🔍 SetupTrustedSetup: Executing system command..."
                );
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/1_run-trusted-setup.sh",
                ]);

                console.log(
                  "🔍 SetupTrustedSetup: Command completed successfully"
                );
                return result;
              } catch (error) {
                console.error("🔍 SetupTrustedSetup: Error occurred:", error);
                throw error;
              }
            }
            throw new Error("Binary is not available or not executable");

          case TokamakActionType.PreProcess:
            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              console.log(
                "🔍 PreProcess: Starting binary-based preprocess action..."
              );

              // Force initialization if no benchmark session exists
              if (!currentSession) {
                console.log(
                  "🔍 PreProcess: No benchmark session found, initializing..."
                );
                await initializeBenchmarkSession();
              }

              // Check global session - use global session if available
              const activeSession = globalBenchmarkSession || currentSession;
              if (!activeSession) {
                console.warn("🔍 PreProcess: No benchmark session available");
              }

              // Benchmarking: Record PreProcess start time
              const preprocessStartTime = startProcessTiming("preprocess");
              console.log(
                "🔍 PreProcess: startProcessTiming result:",
                preprocessStartTime
              );

              try {
                console.log(
                  "🔍 PreProcess: Executing 2_run-preprocess.sh script..."
                );

                // Execute the preprocess script using system bash command
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/2_run-preprocess.sh",
                ]);

                console.log(
                  "🔍 PreProcess: Script execution completed:",
                  result
                );

                // Benchmarking: Record PreProcess successful completion time
                if (preprocessStartTime) {
                  console.log("🔍 PreProcess: Calling endProcessTiming...");
                  endProcessTiming("preprocess", preprocessStartTime, true);
                  console.log("🔍 PreProcess: endProcessTiming completed");
                } else {
                  console.warn(
                    "🔍 PreProcess: preprocessStartTime is null, skipping endProcessTiming"
                  );
                }
                return result;
              } catch (error) {
                console.error("🔍 PreProcess: Error occurred:", error);
                // Benchmarking: Record PreProcess failure time
                if (preprocessStartTime) {
                  console.log(
                    "🔍 PreProcess: Calling endProcessTiming for error..."
                  );
                  endProcessTiming(
                    "preprocess",
                    preprocessStartTime,
                    false,
                    error.message
                  );
                }
                throw error;
              }
            }
            throw new Error("Binary is not available or not executable");

          case TokamakActionType.ProveTransaction:
            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              console.log(
                "🔍 ProveTransaction: Starting binary-based prove action..."
              );

              // Force initialization if no benchmark session exists
              if (!currentSession) {
                console.log(
                  "🔍 ProveTransaction: No benchmark session found, initializing..."
                );
                await initializeBenchmarkSession();
              }

              // Check global session - use global session if available
              const activeSession = globalBenchmarkSession || currentSession;
              if (!activeSession) {
                console.warn(
                  "🔍 ProveTransaction: No benchmark session available"
                );
              }

              // Benchmarking: Record Prove start time
              const proveStartTime = startProcessTiming("prove");

              // Variable to collect prove logs
              let proveLogData = "";

              try {
                console.log(
                  "🔍 ProveTransaction: Executing 3_run-prove.sh script..."
                );

                // Set up streaming data listener for prove logs
                window.binaryService.onStreamData(({ data, isError }) => {
                  if (!isError) {
                    console.log("Prove log:", data);
                    // Collect log data
                    proveLogData += data + "\n";
                  }
                });

                // Execute the prove script using system bash command
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/3_run-prove.sh",
                ]);

                console.log(
                  "🔍 ProveTransaction: Script execution completed:",
                  result
                );

                // Benchmarking: Record Prove successful completion time (including log data)
                if (proveStartTime) {
                  endProcessTiming(
                    "prove",
                    proveStartTime,
                    true,
                    undefined,
                    proveLogData
                  );
                }
                return result;
              } catch (error) {
                console.error("🔍 ProveTransaction: Error occurred:", error);
                // Benchmarking: Record Prove failure time
                if (proveStartTime) {
                  endProcessTiming(
                    "prove",
                    proveStartTime,
                    false,
                    error.message,
                    proveLogData
                  );
                }
                throw error;
              } finally {
                // Clean up streaming listener
                window.binaryService.removeStreamDataListener();
              }
            }
            throw new Error("Binary is not available or not executable");

          case TokamakActionType.Verify:
            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              try {
                console.log(
                  "🔍 Verify: Starting binary-based verify action..."
                );
                console.log("🔍 Verify: Executing 4_run-verify.sh script...");

                // Execute the verify script using system bash command
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/4_run-verify.sh",
                ]);

                console.log("🔍 Verify: Script execution completed:", result);

                const lines = result.trim().split("\n");
                const lastLine = lines[lines.length - 1].trim();

                if (lastLine.startsWith("Verification result:")) {
                  const provingResultValue = lastLine.split(":")[1].trim();

                  // Check true case-insensitively (true, True, TRUE, etc. all allowed)
                  const normalizedResult = provingResultValue.toLowerCase();
                  const isTrue =
                    normalizedResult.includes("true") &&
                    normalizedResult
                      .split(",")
                      .every((part) => part.trim().toLowerCase() === "true");

                  console.log(`🔍 Verification result parsing:`, {
                    raw: provingResultValue,
                    normalized: normalizedResult,
                    isTrue: isTrue,
                  });

                  return {
                    success: isTrue,
                    verificationResult: isTrue,
                    rawResult: result,
                  };
                } else {
                  return {
                    success: false,
                    error: "Verification line not found",
                    rawResult: result,
                  };
                }
              } catch (error) {
                console.error("🔍 Verify: Error occurred:", error);
                return {
                  success: false,
                  error: error.message || "An unknown error occurred",
                  rawResult: null,
                };
              }
            }
            throw new Error("Binary is not available or not executable");

          case TokamakActionType.ExecuteAll:
            try {
              console.log("🚀 ExecuteAll: Starting integrated execution...");

              // Step 1: Run Synthesizer
              console.log("🔍 ExecuteAll: Step 1 - Running Synthesizer...");
              const synthesizerResult = await executeTokamakAction(
                TokamakActionType.RunSynthesizer
              );
              if (synthesizerResult?.success === false) {
                console.error(
                  "❌ ExecuteAll: Synthesizer failed, stopping execution"
                );
                hasError = true;
                return {
                  success: false,
                  error:
                    synthesizerResult.error || "Synthesizer execution failed",
                  step: "synthesizer",
                };
              }

              // Step 2: PreProcess
              console.log("🔍 ExecuteAll: Step 2 - Running PreProcess...");
              const preprocessResult = await executeTokamakAction(
                TokamakActionType.PreProcess
              );
              if (preprocessResult?.success === false) {
                console.error(
                  "❌ ExecuteAll: PreProcess failed, stopping execution"
                );
                hasError = true;
                return {
                  success: false,
                  error:
                    preprocessResult.error || "PreProcess execution failed",
                  step: "preprocess",
                };
              }

              // Step 3: Prove Transaction
              console.log(
                "🔍 ExecuteAll: Step 3 - Running Prove Transaction..."
              );
              const proveResult = await executeTokamakAction(
                TokamakActionType.ProveTransaction
              );
              if (proveResult?.success === false) {
                console.error(
                  "❌ ExecuteAll: Prove Transaction failed, stopping execution"
                );
                hasError = true;
                return {
                  success: false,
                  error:
                    proveResult.error || "Prove Transaction execution failed",
                  step: "prove",
                };
              }

              // Step 4: Verify
              console.log("🔍 ExecuteAll: Step 4 - Running Verify...");
              const verifyResult: any = await executeTokamakAction(
                TokamakActionType.Verify
              );
              if (verifyResult?.success === false) {
                console.error(
                  "❌ ExecuteAll: Verify failed, stopping execution"
                );
                hasError = true;
                return {
                  success: false,
                  error: verifyResult.error || "Verify execution failed",
                  step: "verify",
                };
              }

              console.log("✅ ExecuteAll: All steps completed successfully!");

              // Show ProcessResult modal on successful completion
              setShowProcessResult(true);
              setIsFirstTime(false);

              return {
                success: true,
                verificationResult: verifyResult.verificationResult,
                rawResult: verifyResult.rawResult,
              };
            } catch (error) {
              console.error(
                "❌ ExecuteAll: Integrated execution failed:",
                error
              );
              hasError = true;
              return {
                success: false,
                error: error.message || "An unknown error occurred",
                step: "unknown",
              };
            }

          default:
            console.warn(
              `executeTokamakAction: Unknown action type "${actionType}"`
            );
            return Promise.resolve(undefined);
        }
      } catch (error) {
        console.log("error", error);
        hasError = true;
        setIsError(true);
        initializeWhenCatchError();
        return Promise.resolve({
          success: false,
          error: error.message || "An unknown error occurred",
        });
      } finally {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            setPlaygroundStageInProcess(false);
            resolve();
          }, 0);
        });
      }
    },
    [initializeWhenCatchError, setShowProcessResult, setIsFirstTime]
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

  const runInstallDependencies = useCallback(async () => {
    return executeTokamakAction(TokamakActionType.InstallDependencies);
  }, [executeTokamakAction]);

  const executeAll = useCallback(async () => {
    return await executeTokamakAction(TokamakActionType.ExecuteAll);
  }, [executeTokamakAction]);

  return {
    executeTokamakAction,
    setupEvmSpec,
    runSynthesizer,
    runProve,
    runSetupTrustedSetup,
    runPreProcess,
    runVerify,
    runInstallDependencies,
    executeAll,
  };
}

import { useCallback } from "react";
import { useBinary } from "./useBinary";
import { useSynthesizer } from "./useSynthesizer";
import { useAtom, useSetAtom } from "jotai";
import { useResetStage } from "./useResetStage";
import { usePlaygroundStage } from "./usePlaygroundStage";
import { useBenchmark } from "./useBenchmark";
import {
  isErrorAtom,
  isFirstTimeAtom,
  loadingStageAtom,
  showProcessResultModalAtom,
} from "../atoms/ui";

// CUDA API types are defined in render.d.ts

export enum TokamakActionType {
  SetupEvmSpec = "SETUP_EVM_SPEC",
  RunSynthesizer = "RUN_SYNTHESIZER",
  ProveTransaction = "PROVE_TRANSACTION",
  SetupTrustedSetup = "SETUP_TRUSTED_SETUP",
  PreProcess = "PRE_PROCESS",
  Verify = "VERIFY",
  ExecuteAll = "EXECUTE_ALL",
}

export function useTokamakZkEVMActions() {
  const { startBinary, binaryStatus } = useBinary();
  const { parseTONTransfer } = useSynthesizer();
  const { initializeWhenCatchError } = useResetStage();
  const { setPlaygroundStageInProcess } = usePlaygroundStage();

  const {
    startProcessTiming,
    endProcessTiming,
    initializeBenchmarkSession,
    currentSession,
    globalBenchmarkSession,
  } = useBenchmark();
  // WSL info removed - handled at app startup level
  const setIsError = useSetAtom(isErrorAtom);
  const [, setShowProcessResult] = useAtom(showProcessResultModalAtom);
  const [, setIsFirstTime] = useAtom(isFirstTimeAtom);
  const [, setLoadingStage] = useAtom(loadingStageAtom);

  // ExecuteAll flow tracking removed - WSL checks handled at app startup

  // Helper function to check if we should use WSL for script execution
  const shouldUseWSL = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we're on Windows platform - assume WSL is available if on Windows
      if (typeof window !== "undefined" && window.env?.getEnvironmentInfo) {
        const envInfo = await window.env.getEnvironmentInfo();

        if (envInfo.platform === "win32") {
          console.log("🔍 Platform is Windows, using WSL for script execution");
          return true;
        } else {
          console.log(`🔍 Platform is ${envInfo.platform}, not using WSL`);
          return false;
        }
      }

      console.log("🔍 Environment info not available, not using WSL");
      return false;
    } catch (error) {
      console.error("🔍 Error checking platform for WSL decision:", error);
      return false;
    }
  }, []);

  // Helper function to execute scripts with WSL support
  const executeScriptWithWSLSupport = useCallback(
    async (scriptPath: string): Promise<string> => {
      console.log(`🔍 Executing script: ${scriptPath}`);

      const useWSL = await shouldUseWSL();
      console.log(`🔍 WSL Support Status:`, {
        shouldUseWSLResult: useWSL,
      });

      if (useWSL) {
        console.log("🔍 Using WSL for script execution on Windows");
        // Add WSL-specific error handling
        try {
          // Use the same pattern as Synthesizer: bash -c "cd ... && ./script"
          console.log(
            `🔍 WSL script execution using Synthesizer pattern: ${scriptPath}`
          );

          // Execute script directly without changing directory
          // Since the system command already sets the correct working directory
          return await window.binaryService.executeSystemCommand([
            "bash",
            scriptPath,
          ]);
        } catch (error) {
          console.error("🔍 WSL execution failed:", error);
          // If WSL execution fails, provide helpful error message
          if (error.message?.includes("WSL")) {
            throw new Error(
              `WSL execution failed: ${error.message}. ` +
                "Please ensure WSL is properly installed and configured."
            );
          }
          throw error;
        }
      } else {
        console.log(
          "🔍 Using native execution (non-Windows or WSL not available)"
        );
        // Use system command for native execution
        return await window.binaryService.executeSystemCommand([
          "bash",
          scriptPath,
        ]);
      }
    },
    [shouldUseWSL]
  );

  const executeTokamakAction = useCallback(
    async (actionType: TokamakActionType): Promise<any> => {
      let hasError = false;
      try {
        setPlaygroundStageInProcess(true);
        setShowProcessResult(false);

        // WSL check removed - handled at app startup level

        switch (actionType) {
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

              // Handle the new result format from synthesizer
              if (result && typeof result === "object" && "success" in result) {
                if (result.success) {
                  return result;
                } else {
                  throw new Error(
                    result.error || "Synthesizer execution failed"
                  );
                }
              }

              // Fallback for legacy result format
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
                  "🔍 SetupTrustedSetup: Executing script with WSL support..."
                );
                const result = await executeScriptWithWSLSupport(
                  "src/binaries/1_run-trusted-setup.sh"
                );

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
                  "🔍 PreProcess: Executing 3_run-preprocess.sh script with WSL support..."
                );

                // Execute the preprocess script using WSL-aware helper
                const result = await executeScriptWithWSLSupport(
                  "src/binaries/3_run-preprocess.sh"
                );

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
            } else {
              // Fallback: Try to execute script directly with WSL support
              console.log(
                "🔍 PreProcess: Binary status check failed, trying direct script execution..."
              );

              // Force initialization if no benchmark session exists (fallback mode)
              if (!currentSession) {
                console.log(
                  "🔍 PreProcess (fallback): No benchmark session found, initializing..."
                );
                await initializeBenchmarkSession();
              }

              // Benchmarking: Record PreProcess start time (fallback mode)
              const preprocessStartTime = startProcessTiming("preprocess");
              console.log(
                "🔍 PreProcess (fallback): startProcessTiming result:",
                preprocessStartTime
              );

              try {
                console.log(
                  "🔍 PreProcess: Executing 3_run-preprocess.sh script with WSL support (fallback)..."
                );

                // Execute the preprocess script using WSL-aware helper
                const result = await executeScriptWithWSLSupport(
                  "src/binaries/3_run-preprocess.sh"
                );

                console.log(
                  "🔍 PreProcess: Script execution completed (fallback):",
                  result
                );

                // Benchmarking: Record PreProcess successful completion time (fallback mode)
                if (preprocessStartTime) {
                  console.log(
                    "🔍 PreProcess (fallback): Calling endProcessTiming..."
                  );
                  endProcessTiming("preprocess", preprocessStartTime, true);
                  console.log(
                    "🔍 PreProcess (fallback): endProcessTiming completed"
                  );
                } else {
                  console.warn(
                    "🔍 PreProcess (fallback): preprocessStartTime is null, skipping endProcessTiming"
                  );
                }

                return {
                  success: true,
                  result: result,
                };
              } catch (error) {
                console.error(
                  "🔍 PreProcess: Fallback execution failed:",
                  error
                );

                // Benchmarking: Record PreProcess failure time (fallback mode)
                if (preprocessStartTime) {
                  console.log(
                    "🔍 PreProcess (fallback): Calling endProcessTiming for error..."
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
                  "🔍 ProveTransaction: Executing 4_run-prove.sh script with WSL support..."
                );

                // Set up streaming data listener for prove logs
                window.binaryService.onStreamData(({ data, isError }) => {
                  if (!isError) {
                    console.log("Prove log:", data);

                    // Check if prove2 stage is running
                    if (data.includes("Running prove0...")) {
                      setLoadingStage(2);
                    }

                    if (data.includes("Running prove2...")) {
                      setLoadingStage(3);
                    }

                    if (data.includes("Running prove4...")) {
                      setLoadingStage(4);
                    }

                    // Collect log data
                    proveLogData += data + "\n";
                  }
                });

                // Execute the prove script using WSL-aware helper
                const result = await executeScriptWithWSLSupport(
                  "src/binaries/4_run-prove.sh"
                );

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
            } else {
              // Fallback: Try to execute script directly with WSL support
              console.log(
                "🔍 ProveTransaction: Binary status check failed, trying direct script execution..."
              );

              // Force initialization if no benchmark session exists (fallback mode)
              if (!currentSession) {
                console.log(
                  "🔍 ProveTransaction (fallback): No benchmark session found, initializing..."
                );
                await initializeBenchmarkSession();
              }

              // Benchmarking: Record Prove start time (fallback mode)
              const proveStartTime = startProcessTiming("prove");
              console.log(
                "🔍 ProveTransaction (fallback): startProcessTiming result:",
                proveStartTime
              );

              try {
                console.log(
                  "🔍 ProveTransaction: Executing 4_run-prove.sh script with WSL support (fallback)..."
                );

                // Execute the prove script using WSL-aware helper
                const result = await executeScriptWithWSLSupport(
                  "src/binaries/4_run-prove.sh"
                );

                console.log(
                  "🔍 ProveTransaction: Script execution completed (fallback):",
                  result
                );

                // Benchmarking: Record Prove successful completion time (fallback mode)
                if (proveStartTime) {
                  console.log(
                    "🔍 ProveTransaction (fallback): Calling endProcessTiming..."
                  );
                  endProcessTiming(
                    "prove",
                    proveStartTime,
                    true,
                    undefined,
                    result
                  );
                  console.log(
                    "🔍 ProveTransaction (fallback): endProcessTiming completed"
                  );
                } else {
                  console.warn(
                    "🔍 ProveTransaction (fallback): proveStartTime is null, skipping endProcessTiming"
                  );
                }

                return {
                  success: true,
                  result: result,
                };
              } catch (error) {
                console.error(
                  "🔍 ProveTransaction: Fallback execution failed:",
                  error
                );

                // Benchmarking: Record Prove failure time (fallback mode)
                if (proveStartTime) {
                  console.log(
                    "🔍 ProveTransaction (fallback): Calling endProcessTiming for error..."
                  );
                  endProcessTiming(
                    "prove",
                    proveStartTime,
                    false,
                    error.message
                  );
                }
                throw error;
              }
            }
            throw new Error("Binary is not available or not executable");

          case TokamakActionType.Verify:
            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              try {
                console.log(
                  "🔍 Verify: Starting binary-based verify action..."
                );
                console.log(
                  "🔍 Verify: Executing 5_run-verify.sh script with WSL support..."
                );

                // Execute the verify script using WSL-aware helper
                const result = await executeScriptWithWSLSupport(
                  "src/binaries/5_run-verify.sh"
                );

                console.log("🔍 Verify: Script execution completed:", result);

                const lines = result.trim().split("\n");
                const lastLine = lines[lines.length - 1].trim();

                // Check if the result is "true" (case-insensitive)
                const isTrue = lastLine.toLowerCase() === "true";

                console.log(`🔍 Verification result parsing:`, {
                  raw: lastLine,
                  isTrue: isTrue,
                });

                return {
                  success: isTrue,
                  verificationResult: isTrue,
                  rawResult: result,
                };
              } catch (error) {
                console.error("🔍 Verify: Error occurred:", error);
                return {
                  success: false,
                  error: error.message || "An unknown error occurred",
                  rawResult: null,
                };
              }
            } else {
              // Fallback: Try to execute script directly with WSL support
              console.log(
                "🔍 Verify: Binary status check failed, trying direct script execution..."
              );

              // Force initialization if no benchmark session exists (fallback mode)
              if (!currentSession) {
                console.log(
                  "🔍 Verify (fallback): No benchmark session found, initializing..."
                );
                await initializeBenchmarkSession();
              }

              // Benchmarking: Record Verify start time (fallback mode)
              const verifyStartTime = startProcessTiming("verify");
              console.log(
                "🔍 Verify (fallback): startProcessTiming result:",
                verifyStartTime
              );

              try {
                console.log(
                  "🔍 Verify: Executing 5_run-verify.sh script with WSL support (fallback)..."
                );

                // Execute the verify script using WSL-aware helper
                const result = await executeScriptWithWSLSupport(
                  "src/binaries/5_run-verify.sh"
                );

                console.log(
                  "🔍 Verify: Script execution completed (fallback):",
                  result
                );

                const lines = result.trim().split("\n");
                const lastLine = lines[lines.length - 1].trim();

                console.log(`🔍 Verification result parsing (fallback):`, {
                  allLines: lines,
                  lastLine: lastLine,
                  lastLineLength: lastLine.length,
                });

                // Check if the last line is simply "true" or "false"
                if (
                  lastLine.toLowerCase() === "true" ||
                  lastLine.toLowerCase() === "false"
                ) {
                  const isTrue = lastLine.toLowerCase() === "true";

                  console.log(`🔍 Simple verification result:`, {
                    raw: lastLine,
                    isTrue: isTrue,
                  });

                  // Benchmarking: Record Verify successful completion time (fallback mode)
                  if (verifyStartTime) {
                    console.log(
                      "🔍 Verify (fallback): Calling endProcessTiming..."
                    );
                    endProcessTiming("verify", verifyStartTime, isTrue);
                    console.log(
                      "🔍 Verify (fallback): endProcessTiming completed"
                    );
                  } else {
                    console.warn(
                      "🔍 Verify (fallback): verifyStartTime is null, skipping endProcessTiming"
                    );
                  }

                  return {
                    success: isTrue,
                    verificationResult: isTrue,
                    rawResult: result,
                  };
                }

                console.log(`🔍 Verification result format not recognized:`, {
                  lastLine: lastLine,
                  allLines: lines,
                });

                // Benchmarking: Record Verify failure time (unrecognized format)
                if (verifyStartTime) {
                  console.log(
                    "🔍 Verify (fallback): Calling endProcessTiming for unrecognized format..."
                  );
                  endProcessTiming(
                    "verify",
                    verifyStartTime,
                    false,
                    "Verification line not found or unrecognized format"
                  );
                }

                return {
                  success: false,
                  error: "Verification line not found or unrecognized format",
                  rawResult: result,
                };
              } catch (error) {
                console.error("🔍 Verify: Fallback execution failed:", error);

                // Benchmarking: Record Verify failure time (fallback mode)
                if (verifyStartTime) {
                  console.log(
                    "🔍 Verify (fallback): Calling endProcessTiming for error..."
                  );
                  endProcessTiming(
                    "verify",
                    verifyStartTime,
                    false,
                    error.message
                  );
                }

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

              setLoadingStage(0);

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

              // Synthesizer succeeded, continue to next step

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
              setLoadingStage(1);
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

              setLoadingStage(5);

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
    [
      initializeWhenCatchError,
      setShowProcessResult,
      setIsFirstTime,
      executeScriptWithWSLSupport,
      startProcessTiming,
      endProcessTiming,
      initializeBenchmarkSession,
      currentSession,
      globalBenchmarkSession,
      binaryStatus,
      startBinary,
      parseTONTransfer,
      setPlaygroundStageInProcess,
      setIsError,
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
    executeAll,
    shouldUseWSL,
  };
}

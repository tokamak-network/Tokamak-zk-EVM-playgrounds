import { useCallback } from "react";
import { useBinary } from "./useBinary";
import { useSynthesizer } from "./useSynthesizer";
import { useBackendCommand } from "./useBackend";
import { usePipelineAnimation } from "./usePipelineAnimation";
import {
  provingResultAtom,
  provingIsDoneAtom,
} from "../atoms/pipelineAnimation";
import { proveStepAtom } from "../atoms/modals";
import { useAtom } from "jotai";
import { useResetStage } from "./useResetStage";
import { usePlaygroundStage } from "./usePlaygroundStage";
import { useModals } from "./useModals";
import { DOCKER_NAME } from "../constants";
import { useCuda } from "./useCuda";
import { useBenchmark } from "./useBenchmark";

// CUDA API types are defined in render.d.ts

export enum TokamakActionType {
  InstallDependencies = "INSTALL_DEPENDENCIES",
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
  const [, setProveStep] = useAtom(proveStepAtom);
  const { startBinary, currentProcess, executeCommand, binaryStatus } =
    useBinary();
  // 임시: Docker 관련 변수들을 undefined로 설정 (다른 액션들 때문에)
  const currentDockerContainer: any = undefined;
  const runContainer: any = undefined;
  const dockerConfig: any = undefined;
  const { parseTONTransfer } = useSynthesizer();
  const { setup, preProcess, prove, proveWithStreaming, verify } =
    useBackendCommand();
  const { updateActiveSection } = usePipelineAnimation();
  const { initializeWhenCatchError } = useResetStage();
  const { setPlaygroundStageInProcess } = usePlaygroundStage();
  const { openModal, closeModal } = useModals();
  const { cudaStatus } = useCuda();
  const isCudaSupported = cudaStatus.isFullySupported;
  const {
    startProcessTiming,
    endProcessTiming,
    checkAutoDownload,
    downloadBenchmarkData,
    initializeBenchmarkSession,
    currentSession,
    globalBenchmarkSession,
  } = useBenchmark();

  // Analyze prove logs and update steps
  const analyzeProveLog = useCallback(
    (logData: string) => {
      // Analyze steps based on actual prove logs
      // Prove initialization stays at step 1, Running prove0 starts from step 2
      if (logData.includes("Running prove0")) {
        setProveStep(2); // "Oops, a drop!"
      } else if (logData.includes("Running prove1")) {
        setProveStep(3); // "Rain's starting…"
      } else if (logData.includes("Running prove2")) {
        setProveStep(4); // "Pouring now!"
      } else if (logData.includes("Running prove3")) {
        setProveStep(5); // "Catch it if you can!"
      } else if (logData.includes("Running prove4")) {
        setProveStep(6); // "Still raining!"
      }
    },
    [setProveStep]
  );

  const executeTokamakAction = useCallback(
    async (actionType: TokamakActionType) => {
      let hasError = false;
      try {
        setPlaygroundStageInProcess(true);
        switch (actionType) {
          case TokamakActionType.InstallDependencies:
            updateActiveSection("evm-to-qap");
            openModal("loading");

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
              return updateActiveSection("qap-to-setup-synthesizer");
            } catch (error) {
              console.error("🔍 InstallDependencies: Error occurred:", error);
              throw error;
            }

          case TokamakActionType.SetupEvmSpec:
            try {
              if (isCudaSupported) {
                openModal("loading");
              }

              // Start binary process
              console.log("🚀 Starting binary process");
              const process = await startBinary();

              if (!process?.pid) {
                throw new Error("Failed to start binary process");
              }

              // if (isCudaSupported) {
              //   console.log(
              //     "✅ CUDA supported! Installing ICICLE for GPU acceleration..."
              //   );

              //   try {
              //     // 🔍 컨테이너 내부 디렉토리 구조 디버깅
              //     console.log("🔍 Debugging container directory structure...");

              //     const pwdResult = await executeCommand(container.ID, ["pwd"]);
              //     console.log(
              //       "📍 Current working directory:",
              //       pwdResult.trim()
              //     );

              //     const lsResult = await executeCommand(container.ID, [
              //       "ls",
              //       "-la",
              //     ]);
              //     console.log("📂 Current directory contents:\n", lsResult);

              //     const findBackendResult = await executeCommand(container.ID, [
              //       "find",
              //       ".",
              //       "-name",
              //       "backend",
              //       "-type",
              //       "d",
              //     ]);
              //     console.log(
              //       "🔍 Found 'backend' directories:",
              //       findBackendResult.trim() || "None found"
              //     );

              //     const findScriptResult = await executeCommand(container.ID, [
              //       "find",
              //       ".",
              //       "-name",
              //       "icicle_auto_install.sh",
              //     ]);
              //     console.log(
              //       "🔍 Found 'icicle_auto_install.sh' files:",
              //       findScriptResult.trim() || "None found"
              //     );

              //     // backend 디렉토리가 존재하는지 확인
              //     let backendPath = "";
              //     if (findBackendResult.trim()) {
              //       backendPath = findBackendResult.trim().split("\n")[0]; // 첫 번째 결과 사용
              //       console.log("✅ Using backend path:", backendPath);
              //     } else {
              //       console.log(
              //         "❌ No backend directory found, trying root directory"
              //       );
              //       backendPath = "."; // 현재 디렉토리에서 시도
              //     }

              //     // ICICLE 설치 스크립트 실행
              //     const sedCommand = `cd ${backendPath} && sed -i 's/\\r$//' ./icicle_auto_install.sh`;
              //     console.log("🔧 Running sed command:", sedCommand);
              //     await executeCommand(container.ID, [
              //       "bash",
              //       "-c",
              //       sedCommand,
              //     ]);

              //     console.log("📦 Running ICICLE auto installation...");
              //     const installCommand = `cd ${backendPath} && ./icicle_auto_install.sh`;
              //     console.log("🔧 Running install command:", installCommand);
              //     const installResult = await executeCommand(container.ID, [
              //       "bash",
              //       "-c",
              //       installCommand,
              //     ]);
              //     console.log("📦 ICICLE installation output:", installResult);

              //     console.log("✅ ICICLE installation completed!");
              //   } catch (icicleError) {
              //     console.error("❌ ICICLE installation failed:", icicleError);
              //     console.log("⚠️ Continuing with setup without ICICLE...");
              //   }
              // } else {
              //   console.log(
              //     "ℹ️ CUDA not supported, skipping ICICLE installation:",
              //     cudaStatus.error
              //   );
              // }

              updateActiveSection("evm-to-qap");

              return process;
            } catch (error) {
              console.error("❌ SetupEvmSpec process failed:", error);
              throw error;
            }

          case TokamakActionType.RunSynthesizer:
            console.log("binaryStatus", binaryStatus);
            console.log("binaryInfo details:", binaryStatus.binaryInfo);
            if (binaryStatus.binaryInfo) {
              console.log(
                "Expected binary path:",
                binaryStatus.binaryInfo.path
              );
              console.log("Binary exists:", binaryStatus.binaryInfo.exists);
              console.log(
                "Binary executable:",
                binaryStatus.binaryInfo.executable
              );
              console.log("Platform:", binaryStatus.binaryInfo.platform);
              console.log("Architecture:", binaryStatus.binaryInfo.arch);
            }

            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              openModal("loading");
              await parseTONTransfer();
              return updateActiveSection("synthesizer-to-prove-bikzg");
            }
            throw new Error(
              `Binary is not available or not executable. Path: ${binaryStatus.binaryInfo?.path}, Exists: ${binaryStatus.binaryInfo?.exists}, Executable: ${binaryStatus.binaryInfo?.executable}`
            );

          case TokamakActionType.SetupTrustedSetup:
            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              updateActiveSection("qap-to-setup-synthesizer");
              openModal("loading");

              console.log("🔍 SetupTrustedSetup: Starting setup process...");

              try {
                console.log(
                  "🔍 SetupTrustedSetup: Executing system command..."
                );
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/2_run-trusted-setup.sh",
                ]);

                console.log(
                  "🔍 SetupTrustedSetup: Command completed successfully"
                );
                return updateActiveSection("setup-to-prove");
              } catch (error) {
                console.error("🔍 SetupTrustedSetup: Error occurred:", error);
                throw error;
              }
            }
            throw new Error("Binary is not available or not executable");

          case TokamakActionType.PreProcess:
            if (binaryStatus.isInstalled && binaryStatus.isExecutable) {
              openModal("loading");

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
                return updateActiveSection("bikzg-to-verify");
              }

              // Benchmarking: Record PreProcess start time
              const preprocessStartTime = startProcessTiming("preprocess");
              console.log(
                "🔍 PreProcess: startProcessTiming result:",
                preprocessStartTime
              );

              try {
                console.log(
                  "🔍 PreProcess: Executing 3_run-preprocess.sh script..."
                );

                // Execute the preprocess script using system bash command
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/3_run-preprocess.sh",
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

                return updateActiveSection("bikzg-to-verify");
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
              openModal("prove-loading");
              setProveStep(1); // Set initial step

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
                return updateActiveSection("prove-to-verify");
              }

              // Benchmarking: Record Prove start time
              const proveStartTime = startProcessTiming("prove");

              // Variable to collect prove logs
              let proveLogData = "";

              try {
                console.log(
                  "🔍 ProveTransaction: Executing 4_run-prove.sh script..."
                );

                // Set up streaming data listener for prove logs
                window.binaryService.onStreamData(({ data, isError }) => {
                  if (!isError) {
                    console.log("Prove log:", data);
                    analyzeProveLog(data);
                    // Collect log data
                    proveLogData += data + "\n";
                  }
                });

                // Execute the prove script using system bash command
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/4_run-prove.sh",
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
                  // Check auto download after Prove completion
                  checkAutoDownload();
                }

                return updateActiveSection("prove-to-verify");
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
                openModal("loading");

                console.log(
                  "🔍 Verify: Starting binary-based verify action..."
                );
                console.log("🔍 Verify: Executing 5_run-verify.sh script...");

                // Execute the verify script using system bash command
                const result = await window.binaryService.executeSystemCommand([
                  "bash",
                  "src/binaries/backend/5_run-verify.sh",
                ]);

                console.log("🔍 Verify: Script execution completed:", result);

                const lines = result.trim().split("\n");
                const lastLine = lines[lines.length - 1].trim();

                if (lastLine.startsWith("Verification result:")) {
                  setProvingIsDone(true);
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
                console.error("🔍 Verify: Error occurred:", error);
                setProvingIsDone(true);
                setProvingResult(false);

                return {
                  success: false,
                  error: error.message || "An unknown error occurred",
                  rawResult: null,
                };
              } finally {
                updateActiveSection("verify-to-result");
              }
            }
            throw new Error("Binary is not available or not executable");

          default:
            console.warn(
              `executeTokamakAction: Unknown action type "${actionType}"`
            );
            return Promise.resolve(undefined);
        }
      } catch (error) {
        console.log("error", error);
        hasError = true;
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
            if (!hasError) {
              closeModal();
              // setPendingAnimation(false);
            }
          }, 0);
        });
      }
    },
    [
      runContainer,
      currentDockerContainer,
      parseTONTransfer,
      prove,
      proveWithStreaming,
      analyzeProveLog,
      setProveStep,
      // setPendingAnimation,
      initializeWhenCatchError,
      isCudaSupported,
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

  const runInstallDependencies = useCallback(async () => {
    return executeTokamakAction(TokamakActionType.InstallDependencies);
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
    provingIsDone,
    provingResult,
  };
}

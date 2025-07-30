import { useCallback } from "react";
import { useDocker } from "./useDocker";
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

// CUDA API types are defined in render.d.ts

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
  const [, setProveStep] = useAtom(proveStepAtom);
  const { runContainer, currentDockerContainer, executeCommand, dockerConfig } =
    useDocker();
  const { parseTONTransfer } = useSynthesizer();
  const { setup, preProcess, prove, proveWithStreaming, verify } =
    useBackendCommand();
  const { updateActiveSection } = usePipelineAnimation();
  const { initializeWhenCatchError } = useResetStage();
  const { setPlaygroundStageInProcess } = usePlaygroundStage();
  const { openModal, closeModal } = useModals();
  const { cudaStatus } = useCuda();
  const isCudaSupported = cudaStatus.isFullySupported;

  // Prove 로그 분석 및 step 업데이트 함수
  const analyzeProveLog = useCallback(
    (logData: string) => {
      // 실제 prove 로그를 기준으로 단계 분석
      // Prove initialization은 1단계 유지, Running prove0부터 2단계 시작
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
          case TokamakActionType.SetupEvmSpec:
            try {
              if (isCudaSupported) {
                openModal("loading");
              }

              // Docker 컨테이너 실행 - 환경별 이미지 이름 사용
              const imageName = dockerConfig?.imageName || DOCKER_NAME;
              console.log(
                `🐳 Running Docker container with image: ${imageName}`
              );
              const container = await runContainer(imageName);

              if (!container?.ID) {
                throw new Error("Failed to get container ID after running");
              }

              if (isCudaSupported) {
                console.log(
                  "✅ CUDA supported! Installing ICICLE for GPU acceleration..."
                );

                try {
                  // 🔍 컨테이너 내부 디렉토리 구조 디버깅
                  console.log("🔍 Debugging container directory structure...");

                  const pwdResult = await executeCommand(container.ID, ["pwd"]);
                  console.log(
                    "📍 Current working directory:",
                    pwdResult.trim()
                  );

                  const lsResult = await executeCommand(container.ID, [
                    "ls",
                    "-la",
                  ]);
                  console.log("📂 Current directory contents:\n", lsResult);

                  const findBackendResult = await executeCommand(container.ID, [
                    "find",
                    ".",
                    "-name",
                    "backend",
                    "-type",
                    "d",
                  ]);
                  console.log(
                    "🔍 Found 'backend' directories:",
                    findBackendResult.trim() || "None found"
                  );

                  const findScriptResult = await executeCommand(container.ID, [
                    "find",
                    ".",
                    "-name",
                    "icicle_auto_install.sh",
                  ]);
                  console.log(
                    "🔍 Found 'icicle_auto_install.sh' files:",
                    findScriptResult.trim() || "None found"
                  );

                  // backend 디렉토리가 존재하는지 확인
                  let backendPath = "";
                  if (findBackendResult.trim()) {
                    backendPath = findBackendResult.trim().split("\n")[0]; // 첫 번째 결과 사용
                    console.log("✅ Using backend path:", backendPath);
                  } else {
                    console.log(
                      "❌ No backend directory found, trying root directory"
                    );
                    backendPath = "."; // 현재 디렉토리에서 시도
                  }

                  // ICICLE 설치 스크립트 실행
                  const sedCommand = `cd ${backendPath} && sed -i 's/\\r$//' ./icicle_auto_install.sh`;
                  console.log("🔧 Running sed command:", sedCommand);
                  await executeCommand(container.ID, [
                    "bash",
                    "-c",
                    sedCommand,
                  ]);

                  console.log("📦 Running ICICLE auto installation...");
                  const installCommand = `cd ${backendPath} && ./icicle_auto_install.sh`;
                  console.log("🔧 Running install command:", installCommand);
                  const installResult = await executeCommand(container.ID, [
                    "bash",
                    "-c",
                    installCommand,
                  ]);
                  console.log("📦 ICICLE installation output:", installResult);

                  console.log("✅ ICICLE installation completed!");
                } catch (icicleError) {
                  console.error("❌ ICICLE installation failed:", icicleError);
                  console.log("⚠️ Continuing with setup without ICICLE...");
                }
              } else {
                console.log(
                  "ℹ️ CUDA not supported, skipping ICICLE installation:",
                  cudaStatus.error
                );
              }

              updateActiveSection("evm-to-qap");

              return container;
            } catch (error) {
              console.error("❌ SetupEvmSpec process failed:", error);
              throw error;
            }

          case TokamakActionType.RunSynthesizer:
            console.log("currentDockerContainer", currentDockerContainer);
            if (currentDockerContainer?.ID) {
              openModal("loading");
              await parseTONTransfer(currentDockerContainer.ID);
              return updateActiveSection("synthesizer-to-prove-bikzg");
            }
            throw new Error("currentDockerContainer is not found");

          case TokamakActionType.SetupTrustedSetup:
            if (currentDockerContainer?.ID) {
              if (isCudaSupported) {
                openModal("loading");
                await setup(currentDockerContainer.ID);
              }

              return updateActiveSection("setup-to-prove");
            }
            throw new Error("currentDockerContainer is not found");

          case TokamakActionType.PreProcess:
            if (currentDockerContainer?.ID) {
              // setPendingAnimation(true);
              openModal("loading");
              await preProcess(currentDockerContainer.ID);
              return updateActiveSection("bikzg-to-verify");
            }
            throw new Error("currentDockerContainer is not found");

          case TokamakActionType.ProveTransaction:
            if (currentDockerContainer?.ID) {
              // setPendingAnimation(true);
              openModal("prove-loading");
              setProveStep(1); // 초기 단계 설정

              await proveWithStreaming(
                currentDockerContainer.ID,
                (data, isError) => {
                  if (!isError) {
                    console.log("Prove log:", data);
                    analyzeProveLog(data);
                  }
                }
              );

              return updateActiveSection("prove-to-verify");
            }
            throw new Error("currentDockerContainer is not found");

          case TokamakActionType.Verify:
            if (currentDockerContainer?.ID) {
              try {
                // setPendingAnimation(true);
                openModal("loading");
                const result = await verify(currentDockerContainer.ID);

                const lines = result.trim().split("\n");
                const lastLine = lines[lines.length - 1].trim();

                if (lastLine.startsWith("Verification result:")) {
                  setProvingIsDone(true);
                  const provingResultValue = lastLine.split(":")[1].trim();

                  // 대소문자 구분 없이 true 체크 (true, True, TRUE 등 모두 허용)
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
                setProvingIsDone(true);
                setProvingResult(false);
                return {
                  success: false,
                  error: error.message || "An unknown error occurred",
                  rawResult: null,
                };
              } finally {
                updateActiveSection("verify-to-result");
                // setPendingAnimation(false);
              }
            }
            throw new Error("currentDockerContainer is not found");

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

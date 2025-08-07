import React, { useEffect, useRef } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useAtom } from "jotai";
import Background from "./components/Background";
import PipelineBG from "./components/PipelineBG";
import Logo from "./components/Logo";
import Settings from "./pages/Settings";
import PlaygroundModals from "./components/modals";
import { useDocker } from "./hooks/useDocker";
import { useBenchmark } from "./hooks/useBenchmark";
import {
  cudaStatusAtom,
  cudaInitializedAtom,
  CudaStatus as CudaStatusType,
} from "./atoms/cuda";

// 전역 디버그 로그 플래그
let globalAppDebugLogged = false;

const MainContent = () => {
  // Docker 상태를 지속적으로 모니터링하기 위해 useDocker 훅 호출
  useDocker();

  // 벤치마크 훅 사용
  const { downloadBenchmarkData, isSessionActive, currentSession } =
    useBenchmark();

  // CUDA 상태를 앱 시작 시 한 번만 초기화
  const [, setCudaStatus] = useAtom(cudaStatusAtom);
  const [isInitialized, setIsInitialized] = useAtom(cudaInitializedAtom);

  useEffect(() => {
    if (isInitialized) {
      return; // 이미 초기화되었으면 다시 체크하지 않음
    }

    let isComponentMounted = true;

    const initializeCudaStatus = async () => {
      if (!isComponentMounted) return;

      try {
        console.log(
          "🔍 App: Initializing CUDA status check (one time only)..."
        );
        setCudaStatus((prev: CudaStatusType) => ({
          ...prev,
          isLoading: true,
          error: undefined,
        }));

        const result = await window.cudaAPI.checkCudaSupport();
        console.log("✅ App: CUDA status check completed:", result);

        if (isComponentMounted) {
          setCudaStatus({
            isLoading: false,
            isFullySupported: result.isFullySupported,
            gpu: result.gpu,
            compiler: result.compiler,
            dockerCuda: result.dockerCuda,
          });
          setIsInitialized(true); // 초기화 완료 표시
        }
      } catch (error) {
        console.error("❌ App: CUDA status check failed:", error);
        if (isComponentMounted) {
          setCudaStatus((prev: CudaStatusType) => ({
            ...prev,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to check CUDA support",
          }));
          setIsInitialized(true); // 에러가 나도 초기화 완료로 표시
        }
      }
    };

    initializeCudaStatus();

    return () => {
      isComponentMounted = false;
    };
  }, [isInitialized, setCudaStatus, setIsInitialized]);

  // 벤치마크 데이터 다운로드 핸들러
  const handleDownloadBenchmark = () => {
    if (!isSessionActive || !currentSession) {
      console.warn("No active benchmark session to download");
      return;
    }

    console.log("Downloading benchmark data...");
    downloadBenchmarkData();
  };

  // 벤치마크 데이터가 있는지 확인 (prove 프로세스가 완료되었는지)
  const hasBenchmarkData = currentSession?.processes.prove?.success;

  // 디버깅을 위한 로그 추가 (한 번만 출력)
  if (!globalAppDebugLogged) {
    console.log("Benchmark debug:", {
      isSessionActive,
      hasCurrentSession: !!currentSession,
      hasBenchmarkData,
      proveProcess: currentSession?.processes.prove,
      allProcesses: currentSession?.processes,
    });
    globalAppDebugLogged = true;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Background />
      <Logo />
      <PipelineBG />
      <PlaygroundModals />

      {/* 벤치마크 다운로드 버튼 - 우측 상단 고정 */}
      {hasBenchmarkData && (
        <div
          className="fixed top-4 right-4 z-50 cursor-pointer rounded-lg flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg"
          onClick={handleDownloadBenchmark}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            width: "180px",
            height: "40px",
          }}
        >
          📊 Download Benchmark
        </div>
      )}

      {/* 테스트용 버튼 - 항상 표시 */}
      <div
        className="fixed top-4 right-4 z-50 cursor-pointer rounded-lg flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg"
        onClick={handleDownloadBenchmark}
        style={{
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
          boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
          width: "180px",
          height: "40px",
          top: "60px", // 위 버튼과 겹치지 않도록
        }}
      >
        🧪 Test Benchmark
      </div>

      {/* <CudaStatus /> */}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

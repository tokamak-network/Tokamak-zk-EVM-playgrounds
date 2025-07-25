import React, { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useAtom } from "jotai";
import Background from "./components/Background";
import PipelineBG from "./components/PipelineBG";
import Logo from "./components/Logo";
import Settings from "./pages/Settings";
import PlaygroundModals from "./components/modals";
import CudaStatus from "./components/CudaStatus";
import { useDocker } from "./hooks/useDocker";
import {
  cudaStatusAtom,
  cudaInitializedAtom,
  CudaStatus as CudaStatusType,
} from "./atoms/cuda";

const MainContent = () => {
  // Docker 상태를 지속적으로 모니터링하기 위해 useDocker 훅 호출
  useDocker();

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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Background />
      <Logo />
      <PipelineBG />
      <PlaygroundModals />
      <CudaStatus />
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

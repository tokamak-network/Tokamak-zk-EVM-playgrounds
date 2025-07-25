import { useCallback } from "react";
import { useAtom } from "jotai";
import { cudaStatusAtom, cudaInitializedAtom, CudaStatus } from "../atoms/cuda";

interface CudaHook {
  cudaStatus: CudaStatus;
  checkCudaSupport: () => Promise<void>;
  checkNvidiaGPU: () => Promise<{
    isAvailable: boolean;
    gpuInfo?: string;
    error?: string;
  }>;
  checkCudaCompiler: () => Promise<{
    isAvailable: boolean;
    version?: string;
    error?: string;
  }>;
  checkDockerCudaSupport: () => Promise<{
    isSupported: boolean;
    error?: string;
  }>;
  refreshCudaStatus: () => Promise<void>;
}

export const useCuda = (): CudaHook => {
  const [cudaStatus, setCudaStatus] = useAtom(cudaStatusAtom);
  const [isInitialized, setIsInitialized] = useAtom(cudaInitializedAtom);

  const checkCudaSupport = useCallback(async (): Promise<void> => {
    try {
      console.log("🔄 Manual CUDA status refresh...");
      setCudaStatus((prev: CudaStatus) => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      const result = await window.cudaAPI.checkCudaSupport();
      console.log("✅ Manual CUDA status refresh completed:", result);

      setCudaStatus({
        isLoading: false,
        isFullySupported: result.isFullySupported,
        gpu: result.gpu,
        compiler: result.compiler,
        dockerCuda: result.dockerCuda,
      });
      setIsInitialized(true); // 수동 새로고침도 초기화 완료로 표시
    } catch (error) {
      console.error("❌ Manual CUDA status refresh failed:", error);
      setCudaStatus((prev: CudaStatus) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check CUDA support",
      }));
      setIsInitialized(true); // 에러가 나도 초기화 완료로 표시
    }
  }, [setCudaStatus, setIsInitialized]);

  const checkNvidiaGPU = useCallback(async () => {
    try {
      return await window.cudaAPI.checkNvidiaGPU();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to check NVIDIA GPU";
      return {
        isAvailable: false,
        error: errorMessage,
      };
    }
  }, []);

  const checkCudaCompiler = useCallback(async () => {
    try {
      return await window.cudaAPI.checkCudaCompiler();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to check CUDA compiler";
      return {
        isAvailable: false,
        error: errorMessage,
      };
    }
  }, []);

  const checkDockerCudaSupport = useCallback(async () => {
    try {
      return await window.cudaAPI.checkDockerCudaSupport();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to check Docker CUDA support";
      return {
        isSupported: false,
        error: errorMessage,
      };
    }
  }, []);

  const refreshCudaStatus = useCallback(async (): Promise<void> => {
    console.log("🔄 Refreshing CUDA status (user initiated)...");
    await checkCudaSupport();
  }, [checkCudaSupport]);

  // CUDA 상태는 App.tsx에서 한 번만 초기화 - 개별 컴포넌트에서는 체크하지 않음
  // 이 훅은 전역 상태만 읽어서 반환

  return {
    cudaStatus,
    checkCudaSupport,
    checkNvidiaGPU,
    checkCudaCompiler,
    checkDockerCudaSupport,
    refreshCudaStatus,
  };
};

export default useCuda;

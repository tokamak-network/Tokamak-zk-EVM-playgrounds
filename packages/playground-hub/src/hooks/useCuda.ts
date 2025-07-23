import { useState, useEffect, useCallback } from "react";

interface CudaStatus {
  isLoading: boolean;
  isFullySupported: boolean;
  gpu: {
    isAvailable: boolean;
    gpuInfo?: string;
    error?: string;
  };
  compiler: {
    isAvailable: boolean;
    version?: string;
    error?: string;
  };
  dockerCuda: {
    isSupported: boolean;
    error?: string;
  };
  error?: string;
}

interface CudaHook {
  cudaStatus: CudaStatus;
  checkCudaSupport: () => Promise<void>;
  checkNvidiaGPU: () => Promise<{ isAvailable: boolean; gpuInfo?: string; error?: string }>;
  checkCudaCompiler: () => Promise<{ isAvailable: boolean; version?: string; error?: string }>;
  checkDockerCudaSupport: () => Promise<{ isSupported: boolean; error?: string }>;
  refreshCudaStatus: () => Promise<void>;
}

const initialCudaStatus: CudaStatus = {
  isLoading: true,
  isFullySupported: false,
  gpu: { isAvailable: false },
  compiler: { isAvailable: false },
  dockerCuda: { isSupported: false },
};

export const useCuda = (): CudaHook => {
  const [cudaStatus, setCudaStatus] = useState<CudaStatus>(initialCudaStatus);

  const checkCudaSupport = useCallback(async (): Promise<void> => {
    try {
      setCudaStatus(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const result = await window.cudaAPI.checkCudaSupport();
      
      setCudaStatus({
        isLoading: false,
        isFullySupported: result.isFullySupported,
        gpu: result.gpu,
        compiler: result.compiler,
        dockerCuda: result.dockerCuda,
      });
    } catch (error) {
      setCudaStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to check CUDA support",
      }));
    }
  }, []);

  const checkNvidiaGPU = useCallback(async () => {
    try {
      return await window.cudaAPI.checkNvidiaGPU();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to check NVIDIA GPU";
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
      const errorMessage = error instanceof Error ? error.message : "Failed to check CUDA compiler";
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
      const errorMessage = error instanceof Error ? error.message : "Failed to check Docker CUDA support";
      return {
        isSupported: false,
        error: errorMessage,
      };
    }
  }, []);

  const refreshCudaStatus = useCallback(async (): Promise<void> => {
    await checkCudaSupport();
  }, [checkCudaSupport]);

  // 컴포넌트 마운트 시 CUDA 상태 체크
  useEffect(() => {
    checkCudaSupport();
  }, [checkCudaSupport]);

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
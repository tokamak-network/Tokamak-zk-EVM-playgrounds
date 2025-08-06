export interface ElectronAPI {
  executeCommand: (command: string) => Promise<{
    stdout: string;
    stderr: string;
  }>;
}

interface CudaAPI {
  checkCudaSupport: () => Promise<{
    isFullySupported: boolean;
    gpu: { isAvailable: boolean; gpuInfo?: string; error?: string };
    compiler: { isAvailable: boolean; version?: string; error?: string };
    dockerCuda: { isSupported: boolean; error?: string };
  }>;
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
}

interface ElectronWindowAPI {
  closeSettingsWindow: () => Promise<void>;
  openExternalUrl: (
    url: string
  ) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electron: ElectronWindowAPI;
    env: {
      getEnvVars: () => Promise<{
        RPC_URL: string;
      }>;
      getEnvironmentInfo: () => Promise<{
        platform: string;
        hasGpuSupport: boolean;
        gpuInfo?: { isAvailable: boolean; gpuInfo?: string; error?: string };
        cudaInfo?: { isAvailable: boolean; version?: string; error?: string };
        dockerCudaInfo?: { isSupported: boolean; error?: string };
        error?: string;
      }>;
    };
    cudaAPI: CudaAPI;
  }
}

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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    env: {
      getEnvVars: () => Promise<{
        RPC_URL: string;
      }>;
    };
    cudaAPI: CudaAPI;
  }
}

export interface ElectronAPI {
  executeCommand: (command: string) => Promise<{
    stdout: string;
    stderr: string;
  }>;
  getSystemInfo: () => Promise<{
    cpu: {
      model: string;
      cores: number;
      threads: number;
      architecture: string;
    };
    memory: {
      total: number;
      available: number;
    };
    os: {
      platform: string;
      release: string;
      version: string;
    };
  } | null>;
  on: (channel: string, func: (...args: unknown[]) => void) => void;
  removeListener: (channel: string, func: (...args: unknown[]) => void) => void;
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
      isPackaged: () => Promise<boolean>;
      getEnvironmentInfo: () => Promise<{
        platform: string;
        hasGpuSupport: boolean;
        gpuInfo?: { isAvailable: boolean; gpuInfo?: string; error?: string };
        cudaInfo?: { isAvailable: boolean; version?: string; error?: string };
        dockerCudaInfo?: { isSupported: boolean; error?: string };
        wslInfo?: {
          isAvailable: boolean;
          wsl: {
            isAvailable: boolean;
            version?: string;
            error?: string;
          };
          distribution: {
            isAvailable: boolean;
            distribution?: string;
            error?: string;
          };
        };
        error?: string;
      }>;
    };
    cudaAPI: CudaAPI;
    wslAPI: {
      checkWSLSupport: () => Promise<{
        isAvailable: boolean;
        wsl: {
          isAvailable: boolean;
          version?: string;
          error?: string;
        };
        distribution: {
          isAvailable: boolean;
          distribution?: string;
          error?: string;
        };
      }>;
      checkWSL: () => Promise<{
        isAvailable: boolean;
        version?: string;
        error?: string;
      }>;
      checkWSLDistribution: () => Promise<{
        isAvailable: boolean;
        distribution?: string;
        error?: string;
      }>;
    };
  }
}

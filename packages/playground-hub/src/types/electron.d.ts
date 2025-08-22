declare global {
  interface Window {
    electron: {
      closeSettingsWindow: () => void;
      openExternalUrl: (
        url: string
      ) => Promise<{ success: boolean; error?: string }>;
    };
    electronAPI: {
      getSystemInfo?: () => Promise<Record<string, unknown>>;
      on: (channel: string, func: (...args: unknown[]) => void) => void;
      removeListener: (
        channel: string,
        func: (...args: unknown[]) => void
      ) => void;
    };
    env?: {
      getEnvironmentInfo?: () => Promise<{
        platform: string;
        hasGpuSupport: boolean;
        gpuInfo?: {
          isAvailable: boolean;
          gpuInfo?: string;
          error?: string;
        };
        cudaInfo?: {
          isAvailable: boolean;
          version?: string;
          error?: string;
        };
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
    wslAPI?: {
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

export {};

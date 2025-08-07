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
  }
}

export {};

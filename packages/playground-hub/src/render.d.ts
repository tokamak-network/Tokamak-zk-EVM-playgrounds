export interface ElectronAPI {
  executeCommand: (command: string) => Promise<{
    stdout: string;
    stderr: string;
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
  }
}

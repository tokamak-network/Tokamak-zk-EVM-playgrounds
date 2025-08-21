// src/preload.ts
import { contextBridge, ipcRenderer } from "electron";

// Binary Service
contextBridge.exposeInMainWorld("binaryService", {
  getBinaryInfo: () => ipcRenderer.invoke("binary-get-info"),
  getBinaryStatus: () => ipcRenderer.invoke("binary-get-status"),
  startBinary: (args?: string[]) => ipcRenderer.invoke("binary-start", args),
  stopBinary: (pid?: number) => ipcRenderer.invoke("binary-stop", pid),
  executeCommand: (command: string[]) =>
    ipcRenderer.invoke("binary-execute-command", command),
  executeCommandWithStreaming: (command: string[]) =>
    ipcRenderer.invoke("binary-execute-command-streaming", command),
  onStreamData: (
    callback: (data: { data: string; isError: boolean }) => void
  ) => {
    // Set up streaming first
    ipcRenderer.invoke("binary-setup-streaming");
    ipcRenderer.on("binary-stream-data", (event, data) => callback(data));
    // Also listen for system command streaming
    ipcRenderer.on("system-stream-data", (event, data) => callback(data));
  },
  removeStreamDataListener: () => {
    ipcRenderer.invoke("binary-remove-streaming");
    ipcRenderer.removeAllListeners("binary-stream-data");
    ipcRenderer.removeAllListeners("system-stream-data");
  },
  executeDirectCommand: (command: string[]) =>
    ipcRenderer.invoke("binary-execute-direct", command),
  executeSystemCommand: (command: string[]) =>
    ipcRenderer.invoke("system-execute-command", command),
  executeSystemCommandWithSudo: (command: string[]) =>
    ipcRenderer.invoke("system-execute-command-with-sudo", command),
  executeScriptWithSudo: (scriptPath: string) =>
    ipcRenderer.invoke("system-execute-script-with-sudo", scriptPath),
  readBinaryFile: (filePath: string) =>
    ipcRenderer.invoke("binary-read-file", filePath),
});

//Settings
contextBridge.exposeInMainWorld("electron", {
  closeSettingsWindow: () => ipcRenderer.invoke("close-settings-window"),
  openExternalUrl: (url: string) =>
    ipcRenderer.invoke("open-external-url", url),
});

contextBridge.exposeInMainWorld("electronAPI", {
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func);
  },
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
});

contextBridge.exposeInMainWorld("env", {
  getEnvVars: () => ipcRenderer.invoke("get-env-vars"),
  getEnvironmentInfo: () => ipcRenderer.invoke("get-environment-info"),
});

contextBridge.exposeInMainWorld("fileDownloaderAPI", {
  saveFile: async (defaultFileName: string, content: string) => {
    const result = await ipcRenderer.invoke(
      "show-save-dialog",
      defaultFileName,
      content
    );
    return result;
  },
  showLargeFileSaveDialog: async (defaultFileName: string) => {
    const result = await ipcRenderer.invoke(
      "show-large-file-save-dialog",
      defaultFileName
    );
    return result;
  },
});

// CUDA API
contextBridge.exposeInMainWorld("cudaAPI", {
  checkCudaSupport: () => ipcRenderer.invoke("check-cuda-support"),
  checkNvidiaGPU: () => ipcRenderer.invoke("check-nvidia-gpu"),
  checkCudaCompiler: () => ipcRenderer.invoke("check-cuda-compiler"),
});

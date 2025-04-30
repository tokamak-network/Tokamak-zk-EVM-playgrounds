import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  executeCommand: (command: string, workingDir?: string) =>
    ipcRenderer.invoke("execute-command", command, workingDir),
});

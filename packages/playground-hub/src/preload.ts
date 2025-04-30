import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  executeCommand: (command: string) =>
    ipcRenderer.invoke("execute-command", command),
});

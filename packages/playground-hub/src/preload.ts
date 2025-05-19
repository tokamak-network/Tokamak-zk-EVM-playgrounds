// src/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("docker", {
  getImages: () => ipcRenderer.invoke("get-docker-images"),
  runContainer: (imageName: string, options: string[] = []) =>
    ipcRenderer.invoke("run-docker-container", imageName, options),
  getContainers: () => ipcRenderer.invoke("get-docker-containers"),
  stopContainer: (containerId: string) =>
    ipcRenderer.invoke("stop-docker-container", containerId),
  executeCommand: (containerId: string, command: string[]) =>
    ipcRenderer.invoke("execute-command-in-container", containerId, command),
});

contextBridge.exposeInMainWorld("electron", {
  closeSettingsWindow: () => ipcRenderer.invoke("close-settings-window"),
});

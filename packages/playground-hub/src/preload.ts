// src/preload.ts
import { contextBridge, ipcRenderer } from "electron";

//Docker
contextBridge.exposeInMainWorld("docker", {
  getImages: () => ipcRenderer.invoke("get-docker-images"),
  runContainer: (
    imageName: string,
    options: string[] = [],
    containerName?: string
  ) =>
    ipcRenderer.invoke(
      "run-docker-container",
      imageName,
      options,
      containerName
    ),
  getContainers: () => ipcRenderer.invoke("get-docker-containers"),
  stopContainer: (containerId: string, force?: boolean) =>
    ipcRenderer.invoke("stop-docker-container", containerId, force),
  executeCommand: (containerId: string, command: string[]) =>
    ipcRenderer.invoke("execute-command-in-container", containerId, command),
  executeCommandWithStreaming: (containerId: string, command: string[]) =>
    ipcRenderer.invoke(
      "execute-command-in-container-with-streaming",
      containerId,
      command
    ),
  onStreamData: (
    callback: (data: { data: string; isError: boolean }) => void
  ) => {
    ipcRenderer.on("docker-stream-data", (event, data) => callback(data));
  },
  removeStreamDataListener: () => {
    ipcRenderer.removeAllListeners("docker-stream-data");
  },
  downloadLargeFile: (containerId: string, filePath: string) =>
    ipcRenderer.invoke(
      "download-large-file-from-container",
      containerId,
      filePath
    ),
  streamLargeFile: (
    containerId: string,
    containerFilePath: string,
    localFilePath: string
  ) =>
    ipcRenderer.invoke(
      "stream-large-file-from-container",
      containerId,
      containerFilePath,
      localFilePath
    ),
  checkDockerStatus: (imageNameToCheck?: string) =>
    ipcRenderer.invoke("check-docker-status", imageNameToCheck),
});

//Settings
contextBridge.exposeInMainWorld("electron", {
  closeSettingsWindow: () => ipcRenderer.invoke("close-settings-window"),
  openExternalUrl: (url: string) =>
    ipcRenderer.invoke("open-external-url", url),
});

// File Downloader and Docker Image Loader API
contextBridge.exposeInMainWorld("fileDownloaderAPI", {
  /**
   * 메인 프로세스에 파일 다운로드 및 Docker 이미지 로드를 요청합니다.
   * @param args - { url: string, filename?: string } 형태의 객체
   * @returns Promise<{ success: boolean, message?: string, error?: string }>
   */
  downloadAndLoadImage: (args: { url: string; filename?: string }) =>
    ipcRenderer.invoke("download-and-load-docker-image", args),

  pauseDownload: () => ipcRenderer.send("pause-download"),
  resumeDownload: () => ipcRenderer.send("resume-download"),

  /**
   * 메인 프로세스로부터 다운로드 진행률 업데이트를 수신하기 위한 콜백을 등록합니다.
   * @param callback - (progressData: { percentage: number, downloadedSize: number, totalSize: number | null, message?: string }) => void
   * @returns () => void - 리스너를 제거하는 함수
   */
  onDownloadProgress: (
    callback: (progressData: {
      percentage: number;
      downloadedSize: number;
      totalSize: number | null;
      message?: string;
    }) => void
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: {
        percentage: number;
        downloadedSize: number;
        totalSize: number | null;
        message?: string;
      }
    ) => callback(data);
    ipcRenderer.on("download-progress", listener);
    // 클린업 함수 반환: 이 함수를 호출하면 리스너가 제거됩니다.
    return () => {
      ipcRenderer.removeListener("download-progress", listener);
    };
  },

  /**
   * 메인 프로세스로부터 Docker 이미지 로드 상태 업데이트를 수신하기 위한 콜백을 등록합니다.
   * @param callback - (statusData: { message: string, error?: string, stage: 'downloading' | 'loading' | 'completed' | 'failed' }) => void
   * @returns () => void - 리스너를 제거하는 함수
   */
  onDockerLoadStatus: (
    callback: (statusData: {
      message: string;
      error?: string;
      stage: "downloading" | "loading" | "completed" | "failed";
    }) => void
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: {
        message: string;
        error?: string;
        stage: "downloading" | "loading" | "completed" | "failed";
      }
    ) => callback(data);
    ipcRenderer.on("docker-load-status", listener);
    // 클린업 함수 반환
    return () => {
      ipcRenderer.removeListener("docker-load-status", listener);
    };
  },
});

contextBridge.exposeInMainWorld("electronAPI", {
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func);
  },
});

contextBridge.exposeInMainWorld("env", {
  getEnvVars: () => ipcRenderer.invoke("get-env-vars"),
  getEnvironmentInfo: () => ipcRenderer.invoke("get-environment-info"),
});

contextBridge.exposeInMainWorld("dockerFileDownloaderAPI", {
  saveFile: async (defaultFileName: string, content: string) => {
    const result = await ipcRenderer.invoke(
      "show-save-dialog",
      defaultFileName,
      content
    );
    return result;
  },
});

// CUDA API
contextBridge.exposeInMainWorld("cudaAPI", {
  checkCudaSupport: () => ipcRenderer.invoke("check-cuda-support"),
  checkNvidiaGPU: () => ipcRenderer.invoke("check-nvidia-gpu"),
  checkCudaCompiler: () => ipcRenderer.invoke("check-cuda-compiler"),
  checkDockerCudaSupport: () => ipcRenderer.invoke("check-docker-cuda-support"),
});

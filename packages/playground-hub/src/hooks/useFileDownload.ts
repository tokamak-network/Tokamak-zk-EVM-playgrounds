import { useState, useCallback, useEffect } from "react";

// Type declarations for the API defined in preload.ts (to use as if it exists on the window object)
// Can be separated into a d.ts file for better management if needed.
declare global {
  interface Window {
    fileDownloaderAPI: {
      downloadAndLoadImage: (args: {
        url: string;
        filename?: string;
      }) => Promise<{ success: boolean; message?: string; error?: string }>;
      onDownloadProgress: (
        callback: (progressData: DownloadProgressData) => void
      ) => () => void;
      onDockerLoadStatus: (
        callback: (statusData: DockerLoadStatusData) => void
      ) => () => void;
      pauseDownload: () => Promise<void>;
      resumeDownload: () => Promise<void>;
    };
  }
}

export interface DownloadProgressData {
  percentage: number;
  downloadedSize: number;
  totalSize: number | null;
  message?: string; // Additional message from the main process if needed
}

export interface DockerLoadStatusData {
  stage: "idle" | "downloading" | "loading" | "completed" | "failed";
  message: string;
  error?: string;
}

interface UseElectronFileDownloaderResult {
  /**
   * Start downloading a file from the specified URL and load it as a Docker image.
   * @param url URL of the file to download
   * @param filename File name to save (optional). Main process will use default if not provided.
   */
  startDownloadAndLoad: (url: string, filename?: string) => Promise<void>;
  /** Current download progress status */
  downloadProgress: DownloadProgressData;
  /** Current Docker image load status */
  loadStatus: DockerLoadStatusData;
  /** Whether file is being processed (downloading or loading) */
  isProcessing: boolean;
  isPaused: boolean;
  /** Pause download */
  pauseDownload: () => Promise<void>;
  /** Resume download */
  resumeDownload: () => Promise<void>;
}

/**
 * React custom hook for file download, Docker image loading, and progress/status tracking in Electron environment.
 */
const useElectronFileDownloader = (): UseElectronFileDownloaderResult => {
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgressData>({
      percentage: 0,
      downloadedSize: 0,
      totalSize: null,
    });
  const [loadStatus, setLoadStatus] = useState<DockerLoadStatusData>({
    stage: "idle",
    message: "Ready to start.",
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    // Set up download progress listener
    const progressCallback = (data: DownloadProgressData) => {
      setDownloadProgress(data);
      // Can also update loadStatus message (e.g., "Downloading: X MB / Y MB")
      // setLoadStatus(prev => ({ ...prev, message: `Downloading: ${data.percentage}%`}));
    };
    const unsubscribeProgress =
      window.fileDownloaderAPI.onDownloadProgress(progressCallback);

    // Set up Docker load status listener
    const statusCallback = (data: DockerLoadStatusData) => {
      setLoadStatus(data);
      if (data.stage === "completed" || data.stage === "failed") {
        setIsProcessing(false);
      }
      if (data.stage === "downloading") {
        // downloadProgress covers this stage, so no special state change here
        // Or can set a more explicit message
      }
    };
    const unsubscribeStatus =
      window.fileDownloaderAPI.onDockerLoadStatus(statusCallback);

    // Clean up listeners on component unmount
    return () => {
      unsubscribeProgress();
      unsubscribeStatus();
    };
  }, []); // Empty array to run only once on mount

  const startDownloadAndLoad = useCallback(
    async (url: string, filename?: string) => {
      if (!window.fileDownloaderAPI) {
        console.error(
          "File Downloader API is not available on window object. Check preload script."
        );
        setLoadStatus({
          stage: "failed",
          message: "Application setup error. API not available.",
          error: "Preload API not found",
        });
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      setLoadStatus({ stage: "idle", message: "Initializing..." });
      setDownloadProgress({
        percentage: 0,
        downloadedSize: 0,
        totalSize: null,
      }); // Initialize progress

      try {
        // Request work from main process
        const result = await window.fileDownloaderAPI.downloadAndLoadImage({
          url,
          filename,
        });

        // downloadAndLoadImage return value is the final result,
        // so the final status should already be updated via onDockerLoadStatus.
        // Here we can do additional logging or final UI updates.
        if (result.success) {
          console.log("Main process reported overall success:", result.message);
        } else {
          console.error("Main process reported overall failure:", result.error);
          // setLoadStatus likely already handled in onDockerLoadStatus callback
          // Defensive code in case IPC message is missed
          if (loadStatus.stage !== "failed") {
            setLoadStatus({
              stage: "failed",
              message: result.error || "Failed after IPC call.",
              error: result.error,
            });
          }
        }
      } catch (err) {
        // Error from invoke itself
        console.error("Error invoking downloadAndLoadImage:", err);
        setLoadStatus({
          stage: "failed",
          message:
            err instanceof Error
              ? err.message
              : "An unknown IPC error occurred.",
          error: err instanceof Error ? err.message : String(err),
        });
        setIsProcessing(false);
      }
      // isProcessing is set to false in onDockerLoadStatus callback when 'completed' or 'failed'
    },
    [loadStatus.stage] // Recreate callback when loadStatus.stage changes (check state value to prevent duplicate execution)
  );

  const pauseDownload = useCallback(async () => {
    if (window.fileDownloaderAPI && isProcessing && !isPaused) {
      await window.fileDownloaderAPI.pauseDownload();
      setIsPaused(true);
      setLoadStatus((prev) => ({
        ...prev,
        message: "Download paused.",
      }));
    }
  }, [isProcessing, isPaused]);

  const resumeDownload = useCallback(async () => {
    if (window.fileDownloaderAPI && isPaused) {
      await window.fileDownloaderAPI.resumeDownload();
      setIsPaused(false);
      setLoadStatus((prev) => ({
        ...prev,
        message: "Download resumed.",
      }));
    }
  }, [isPaused]);

  return {
    startDownloadAndLoad,
    downloadProgress,
    loadStatus,
    isProcessing,
    isPaused,
    pauseDownload,
    resumeDownload,
  };
};

export default useElectronFileDownloader;

import { useState, useCallback, useEffect, useRef } from "react";

// preload.ts에서 정의한 API를 위한 타입 선언 (실제 window 객체에 있는 것처럼 사용하기 위함)
// 필요하다면 d.ts 파일로 분리하여 관리할 수 있습니다.
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
    };
  }
}

export interface DownloadProgressData {
  percentage: number;
  downloadedSize: number;
  totalSize: number | null;
  message?: string; // 메인 프로세스에서 추가적인 메시지를 보낼 경우
}

export interface DockerLoadStatusData {
  stage: "idle" | "downloading" | "loading" | "completed" | "failed";
  message: string;
  error?: string;
}

interface UseElectronFileDownloaderResult {
  /**
   * 지정된 URL에서 파일 다운로드를 시작하고 Docker 이미지로 로드합니다.
   * @param url 다운로드할 파일의 URL
   * @param filename 저장할 파일 이름 (선택 사항). 메인 프로세스에서 기본값을 사용합니다.
   */
  startDownloadAndLoad: (url: string, filename?: string) => Promise<void>;
  /** 현재 다운로드 진행 상태 */
  downloadProgress: DownloadProgressData;
  /** 현재 Docker 이미지 로드 상태 */
  loadStatus: DockerLoadStatusData;
  /** 파일 처리 중인지 여부 (다운로드 또는 로딩) */
  isProcessing: boolean;
}

/**
 * Electron 환경에서 파일 다운로드, Docker 이미지 로드 및 진행률/상태 추적을 위한 React 커스텀 훅입니다.
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

  // useEffect 내에서 IPC 리스너 관리를 위해 ref 사용 (선택적이지만 안정적)
  const onDownloadProgressListenerRef = useRef<
    ((data: DownloadProgressData) => void) | null
  >(null);
  const onDockerLoadStatusListenerRef = useRef<
    ((data: DockerLoadStatusData) => void) | null
  >(null);

  useEffect(() => {
    // 다운로드 진행률 리스너 설정
    const progressCallback = (data: DownloadProgressData) => {
      setDownloadProgress(data);
      // loadStatus의 메시지도 업데이트할 수 있음 (예: "Downloading: X MB / Y MB")
      // setLoadStatus(prev => ({ ...prev, message: `Downloading: ${data.percentage}%`}));
    };
    onDownloadProgressListenerRef.current = progressCallback; // ref에 콜백 저장
    const unsubscribeProgress =
      window.fileDownloaderAPI.onDownloadProgress(progressCallback);

    // Docker 로드 상태 리스너 설정
    const statusCallback = (data: DockerLoadStatusData) => {
      setLoadStatus(data);
      if (data.stage === "completed" || data.stage === "failed") {
        setIsProcessing(false);
      }
      if (data.stage === "downloading") {
        // downloadProgress가 이 stage를 커버하므로, 여기서는 특별히 상태를 변경 안 함
        // 또는 더 명확한 메시지를 설정할 수 있음
      }
    };
    onDockerLoadStatusListenerRef.current = statusCallback; // ref에 콜백 저장
    const unsubscribeStatus =
      window.fileDownloaderAPI.onDockerLoadStatus(statusCallback);

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      unsubscribeProgress();
      unsubscribeStatus();
    };
  }, []); // 빈 배열로 마운트 시 한 번만 실행

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
      }); // 진행률 초기화

      try {
        // 메인 프로세스에 작업 요청
        const result = await window.fileDownloaderAPI.downloadAndLoadImage({
          url,
          filename,
        });

        // downloadAndLoadImage의 반환값은 최종 결과이므로,
        // onDockerLoadStatus를 통해 이미 최종 상태가 업데이트 되었을 것임.
        // 여기서는 추가적인 로깅이나 아주 최종적인 UI 업데이트를 할 수 있음.
        if (result.success) {
          console.log("Main process reported overall success:", result.message);
        } else {
          console.error("Main process reported overall failure:", result.error);
          // setLoadStatus는 onDockerLoadStatus 콜백에서 이미 처리되었을 가능성이 높음
          // 만약 IPC 메시지가 누락될 경우를 대비한 방어 코드
          if (loadStatus.stage !== "failed") {
            setLoadStatus({
              stage: "failed",
              message: result.error || "Failed after IPC call.",
              error: result.error,
            });
          }
        }
      } catch (err) {
        // invoke 자체에서 발생한 에러
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
      // isProcessing은 onDockerLoadStatus 콜백에서 'completed' 또는 'failed' 시 false로 설정됨
    },
    [loadStatus.stage] // loadStatus.stage 변경 시 콜백 재생성 (중복 실행 방지용으로 상태값 확인)
  );

  return { startDownloadAndLoad, downloadProgress, loadStatus, isProcessing };
};

export default useElectronFileDownloader;

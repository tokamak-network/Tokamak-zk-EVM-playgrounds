import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  DockerImage,
  DockerContainer,
  currentDockerContainerAtom,
} from "../atoms/docker";
import { useAtom } from "jotai";
import { DOCKER_NAME, getDockerConfigForEnvironment } from "../constants";
import useCuda from "./useCuda";

// 전역 플래그로 중복 실행 방지
let globalCleanupInProgress = false;
let globalCleanupCompleted = false;

// 개발 모드에서 새로고침 시 전역 상태 리셋
if (typeof window !== "undefined") {
  (
    window as typeof window & { __resetDockerCleanup?: () => void }
  ).__resetDockerCleanup = () => {
    globalCleanupInProgress = false;
    globalCleanupCompleted = false;
    console.log("🔄 Global Docker cleanup state reset");
  };
}

// Define the expected shape of the status from window.docker.checkDockerStatus
// This should match DockerStatusResult from your docker-service.ts
interface DockerStatusCheckResult {
  isInstalled: boolean;
  isRunning: boolean;
  imageExists?: boolean; // Optional because it depends on imageNameToCheck
  isContainerFromImageRunning?: boolean; // Optional
}

// Extend Window interface
declare global {
  interface Window {
    docker: {
      getImages: () => Promise<DockerImage[]>;
      runContainer: (
        imageName: string,
        options?: string[]
      ) => Promise<DockerContainer>;
      getContainers: () => Promise<DockerContainer[]>;
      stopContainer: (containerId: string, force?: boolean) => Promise<boolean>;
      executeCommand: (
        containerId: string,
        command: string[]
      ) => Promise<string>;
      executeCommandWithStreaming: (
        containerId: string,
        command: string[]
      ) => Promise<string>;
      onStreamData: (
        callback: (data: { data: string; isError: boolean }) => void
      ) => void;
      removeStreamDataListener: () => void;
      downloadLargeFile: (
        containerId: string,
        filePath: string
      ) => Promise<string>;
      streamLargeFile: (
        containerId: string,
        containerFilePath: string,
        localFilePath: string
      ) => Promise<boolean>;
      checkDockerStatus: (
        imageNameToCheck?: string
      ) => Promise<DockerStatusCheckResult>;
    };
    // cudaAPI types are defined in render.d.ts
  }
}

// Add an optional parameter to the hook for the polling image name
export const useDocker = () => {
  // console.log("🔧 useDocker hook called at:", new Date().toISOString()); // 디버깅용 - 주석 처리

  // 🚀 ULTRA-IMMEDIATE: 훅 호출 즉시 컨테이너 정지 (useEffect 대기 없음)
  if (!globalCleanupCompleted && !globalCleanupInProgress) {
    globalCleanupInProgress = true;
    console.log(
      "⚡⚡ ULTRA-IMMEDIATE cleanup starting at:",
      new Date().toISOString()
    );

    // 즉시 실행 (await 없이 비동기 실행)
    (async () => {
      try {
        if (window.docker?.getContainers && window.docker?.stopContainer) {
          console.log(
            "🔍 ULTRA-IMMEDIATE: Checking containers at:",
            new Date().toISOString()
          );
          const currentContainers = await window.docker.getContainers();

          if (currentContainers.length > 0) {
            console.log(
              `⚡ ULTRA-IMMEDIATE: Force killing ${currentContainers.length} containers at:`,
              new Date().toISOString()
            );

            const stopPromises = currentContainers.map(async (container) => {
              try {
                // 🚀 FORCE KILL for instant shutdown (much faster than docker stop)
                await window.docker.stopContainer(container.ID, true);
                console.log(
                  `✅ ULTRA-IMMEDIATE: Force killed ${container.ID} at:`,
                  new Date().toISOString()
                );
                return { success: true, containerId: container.ID };
              } catch (stopError) {
                console.error(
                  `❌ ULTRA-IMMEDIATE: Failed to force kill ${container.ID}:`,
                  stopError
                );
                return {
                  success: false,
                  containerId: container.ID,
                  error: stopError,
                };
              }
            });

            const results = await Promise.all(stopPromises);
            const successful = results.filter((r) => r.success).length;
            console.log(
              `🎉 ULTRA-IMMEDIATE: ${successful} containers force killed at:`,
              new Date().toISOString()
            );
          } else {
            console.log(
              "⚡ ULTRA-IMMEDIATE: No containers found at:",
              new Date().toISOString()
            );
          }
        }

        globalCleanupCompleted = true;
        console.log(
          "🔒 ULTRA-IMMEDIATE cleanup completed at:",
          new Date().toISOString()
        );

        // cleanup 완료 후 Docker 상태 강제 업데이트를 위한 이벤트 발생
        // 약간의 지연을 두어 React state가 안정화된 후 이벤트 발생
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("dockerCleanupCompleted"));
        }, 100);
      } catch (err) {
        console.error("ULTRA-IMMEDIATE cleanup failed:", err);
      } finally {
        globalCleanupInProgress = false;
      }
    })();
  } else if (globalCleanupCompleted) {
    // console.log("⚡ ULTRA-IMMEDIATE: Already completed, skipping"); // 디버깅용 - 주석 처리
  } else {
    // console.log("⚡ ULTRA-IMMEDIATE: Already in progress, skipping"); // 디버깅용 - 주석 처리
  }

  // const selectedDockerImage = useAtomValue(selectedDockerImageAtom);
  const [dockerConfig, setDockerConfig] = useState<{
    tag: string;
    downloadUrl: string;
    fileName: string;
    imageName: string;
  } | null>(null);

  const selectedDockerImage = dockerConfig?.imageName || DOCKER_NAME;
  const imageNameForPolling = selectedDockerImage ?? null;
  const [images, setImages] = useState<DockerImage[]>([]);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDockerContainer, setCurrentDockerContainer] = useAtom(
    currentDockerContainerAtom
  );
  const [dockerStatus, setDockerStatus] = useState<DockerStatusCheckResult>({
    isInstalled: false,
    isRunning: false,
    imageExists: false,
    isContainerFromImageRunning: false,
  });
  const [isDockerStatusLoading, setIsDockerStatusLoading] =
    useState<boolean>(true);

  const { cudaStatus } = useCuda();
  const hasInitialized = useRef(false);

  // Load environment-specific Docker configuration
  useEffect(() => {
    const loadDockerConfig = async () => {
      try {
        const config = await getDockerConfigForEnvironment();
        setDockerConfig(config);
        // Log removed as it's now handled in getDockerConfigForEnvironment with caching
      } catch (error) {
        console.error("Failed to load Docker config:", error);
        // Use default config as fallback
        setDockerConfig({
          tag: "latest",
          downloadUrl: "",
          fileName: "",
          imageName: DOCKER_NAME,
        });
      }
    };

    loadDockerConfig();
  }, []);

  // Docker 상태 체크 (now accepts imageNameToCheck)
  const verifyDockerStatus = useCallback(async (imageNameToCheck?: string) => {
    try {
      const status = await window.docker.checkDockerStatus(imageNameToCheck);
      setDockerStatus(status);
      return status;
    } catch (err) {
      console.error("Failed to check Docker status:", err);
      const errorStatus = {
        isInstalled: false, // Don't reference previous state to avoid dependency loops
        isRunning: false,
        imageExists: false,
        isContainerFromImageRunning: false,
      };
      setDockerStatus(errorStatus);
      return errorStatus;
    }
  }, []);

  // Docker cleanup 완료 이벤트 리스너 (중복 실행 방지)
  useEffect(() => {
    let isHandlingCleanup = false;

    const handleCleanupCompleted = async () => {
      // 이미 처리 중이면 스킵
      if (isHandlingCleanup) {
        console.log("🔔 Cleanup event already being handled, skipping...");
        return;
      }

      isHandlingCleanup = true;

      try {
        // cleanup 완료 후 Docker 상태를 다시 체크

        if (window.docker?.checkDockerStatus && dockerConfig?.imageName) {
          const updatedStatus = await window.docker.checkDockerStatus(
            dockerConfig.imageName
          );
          setDockerStatus(updatedStatus);

          // 상태 업데이트가 React에 반영될 시간을 충분히 주기
          await new Promise((resolve) => setTimeout(resolve, 300));

          // 컨테이너 목록도 다시 로드하여 정확한 상태 확인
          try {
            console.log("🔄 Re-loading container list after cleanup...");
            if (window.docker?.getContainers) {
              const containers = await window.docker.getContainers();
              setContainers(containers);
            }

            // 이미지 목록도 다시 로드

            if (window.docker?.getImages) {
              const images = await window.docker.getImages();
              setImages(images);
            }
          } catch (loadError) {
            console.error("❌ Failed to reload containers/images:", loadError);
          }

          // 추가 상태 안정화 대기
          console.log("⏳ Final stabilization wait...");
          await new Promise((resolve) => setTimeout(resolve, 200));
        } else {
          // dockerConfig가 없어도 cleanup은 완료되었으므로 계속 진행
          // regular polling에서 config 로드 후 상태를 체크할 것임
        }
      } catch (err) {
        console.error("❌ Failed to update Docker status after cleanup:", err);
      } finally {
        // cleanup 완료 이벤트 처리 끝 - loading 완료는 regular polling에서 처리
        console.log("🏁 Cleanup event handling completed");
        isHandlingCleanup = false; // 처리 완료 표시
      }
    };

    window.addEventListener("dockerCleanupCompleted", handleCleanupCompleted);
    return () => {
      window.removeEventListener(
        "dockerCleanupCompleted",
        handleCleanupCompleted
      );
    };
  }, [dockerConfig]);

  // dockerConfig 로드 후 cleanup이 완료되었다면 상태 다시 체크
  useEffect(() => {
    if (dockerConfig && globalCleanupCompleted && isDockerStatusLoading) {
      const recheckStatus = async () => {
        try {
          if (window.docker?.checkDockerStatus) {
            const updatedStatus = await window.docker.checkDockerStatus(
              dockerConfig.imageName
            );
            setDockerStatus(updatedStatus);

            // 컨테이너/이미지 목록도 다시 로드
            if (window.docker?.getContainers) {
              const containers = await window.docker.getContainers();
              setContainers(containers);
            }
            if (window.docker?.getImages) {
              const images = await window.docker.getImages();
              setImages(images);
            }

            // loading 완료는 일반 Docker status polling에서 처리
          }
        } catch (err) {
          console.error("❌ Failed to recheck status after config load:", err);
          setIsDockerStatusLoading(false);
        }
      };

      recheckStatus();
    }
  }, [dockerConfig]);

  // 초기 로딩 시 Docker 상태 체크 및 스마트 주기적 체크
  useEffect(() => {
    // Docker 설정이 로드되지 않았으면 대기
    if (!dockerConfig) return;

    let checkInterval: NodeJS.Timeout | null = null;
    let isComponentMounted = true;
    let consecutiveSuccessCount = 0;
    let lastStatus: DockerStatusCheckResult | null = null;

    const performCheck = async (imageName?: string) => {
      if (!isComponentMounted) return;
      try {
        const status = await window.docker.checkDockerStatus(imageName);
        if (isComponentMounted) {
          // 상태가 변경되었을 때만 업데이트
          const hasStatusChanged =
            !lastStatus ||
            lastStatus.isInstalled !== status.isInstalled ||
            lastStatus.isRunning !== status.isRunning ||
            lastStatus.imageExists !== status.imageExists ||
            lastStatus.isContainerFromImageRunning !==
              status.isContainerFromImageRunning;

          if (hasStatusChanged) {
            setDockerStatus(status);
            lastStatus = status;
            consecutiveSuccessCount = 0; // 상태 변화 시 카운트 리셋
          } else {
            consecutiveSuccessCount++;
          }

          // Docker cleanup이 완료된 후에만 로딩 상태를 false로 설정
          // cleanup이 완료되지 않았다면 절대 loading을 끝내지 않음
          if (globalCleanupCompleted) {
            // cleanup이 완료되었고 config도 있다면 바로 loading 끝내기
            if (dockerConfig?.imageName) {
              setTimeout(() => {
                setIsDockerStatusLoading(false);
              }, 100);
            }
          } else {
            // cleanup이 완료되지 않았으면 loading 상태 강제 유지
            if (!isDockerStatusLoading) {
              setIsDockerStatusLoading(true);
            }
          }

          // 상태가 안정적이면 체크 간격을 늘림
          if (consecutiveSuccessCount >= 3 && checkInterval) {
            clearInterval(checkInterval);
            checkInterval = setInterval(() => {
              performCheck(imageNameForPolling);
            }, 30000); // 30초로 간격 증가
          }
        }
      } catch (err) {
        console.error("Failed to check Docker status:", err);
        consecutiveSuccessCount = 0;
        if (isComponentMounted) {
          const errorStatus = {
            isInstalled: false,
            isRunning: false,
            imageExists: false,
            isContainerFromImageRunning: false,
          };
          if (
            !lastStatus ||
            JSON.stringify(lastStatus) !== JSON.stringify(errorStatus)
          ) {
            setDockerStatus(errorStatus);
            lastStatus = errorStatus;
          }
        }
      }
    };

    // 초기 체크
    performCheck(imageNameForPolling);

    // 초기에는 10초마다 체크
    checkInterval = setInterval(() => {
      performCheck(imageNameForPolling);
    }, 10000);

    return () => {
      isComponentMounted = false;
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [imageNameForPolling, dockerConfig]);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dockerImages = await window.docker.getImages();
      setImages(dockerImages);
      return dockerImages;
    } catch (err) {
      const errorMessage =
        "Failed to load Docker images: " +
        (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dockerContainers = await window.docker.getContainers();
      setContainers(dockerContainers);
      return dockerContainers;
    } catch (err) {
      const errorMessage =
        "Failed to load Docker containers: " +
        (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run container
  const runContainer = useCallback(
    async (imageName: string) => {
      // First, verify general Docker status and specific image status
      const currentStatus = await verifyDockerStatus(imageName);

      if (!currentStatus.isInstalled || !currentStatus.isRunning) {
        setError("Docker is not installed or not running.");
        throw new Error("Docker is not installed or not running.");
      }

      // Check if the specific image for running exists
      if (!currentStatus.imageExists) {
        const imageMissingError = `Docker image "${imageName}" not found. Please download it first.`;
        setError(imageMissingError);
        throw new Error(imageMissingError);
      }

      // This check is somewhat redundant if imageName must be a non-empty string,
      // but it's kept for robustness.
      if (!imageName) {
        const errorMessage = "Image name is required";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Check CUDA support and configure Docker options accordingly
      let options = ["-it", "--rm", "-p", "8080:8080"];

      try {
        console.log("Checking CUDA support for Docker container...");

        if (cudaStatus.isFullySupported) {
          console.log("CUDA support detected. Adding --gpus all option.");
          options = ["--gpus", "all", "-it"];
        } else {
          console.log("CUDA not supported or not available:", cudaStatus.error);
          console.log("Running container without GPU acceleration.");
        }
      } catch (cudaError) {
        console.warn(
          "Failed to check CUDA support, proceeding without GPU:",
          cudaError
        );
        // Continue without GPU acceleration if CUDA check fails
      }

      console.log("Docker run options:", options);

      setLoading(true);
      setError(null);
      try {
        const container = await window.docker.runContainer(imageName, options);
        if (container) {
          setCurrentDockerContainer(container);
          await loadContainers();
          // After running, update status, especially isContainerFromImageRunning
          await verifyDockerStatus(imageName);
        }
        return container;
      } catch (err) {
        const errorMessage =
          "Failed to run Docker container: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [verifyDockerStatus, setCurrentDockerContainer, loadContainers, cudaStatus]
  );

  // Stop container
  const stopContainer = useCallback(
    async (containerId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await window.docker.stopContainer(containerId);
        await loadContainers();
        if (
          currentDockerContainer &&
          currentDockerContainer.ID === containerId
        ) {
          setCurrentDockerContainer(null);
        }
        return result;
      } catch (err) {
        const errorMessage =
          "Failed to stop Docker container: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loadContainers, currentDockerContainer, setCurrentDockerContainer]
  );

  // Execute command in container
  const executeCommand = useCallback(
    async (containerId: string, command: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const output = await window.docker.executeCommand(containerId, command);

        return output;
      } catch (err) {
        const errorMessage =
          "Failed to execute command in container: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Execute command in container with streaming
  const executeCommandWithStreaming = useCallback(
    async (
      containerId: string,
      command: string[],
      onData?: (data: string, isError: boolean) => void
    ) => {
      setLoading(true);
      setError(null);

      if (onData) {
        window.docker.onStreamData(({ data, isError }) => {
          onData(data, isError);
        });
      }

      try {
        const output = await window.docker.executeCommandWithStreaming(
          containerId,
          command
        );
        return output;
      } catch (err) {
        const errorMessage =
          "Failed to execute streaming command in container: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
        if (onData) {
          window.docker.removeStreamDataListener();
        }
      }
    },
    []
  );

  // Download large file from container
  const downloadLargeFile = useCallback(
    async (containerId: string, filePath: string) => {
      setLoading(true);
      setError(null);
      try {
        const content = await window.docker.downloadLargeFile(
          containerId,
          filePath
        );
        return content;
      } catch (err) {
        const errorMessage =
          "Failed to download large file from container: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Stream large file directly to local file
  const streamLargeFile = useCallback(
    async (
      containerId: string,
      containerFilePath: string,
      localFilePath: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const success = await window.docker.streamLargeFile(
          containerId,
          containerFilePath,
          localFilePath
        );
        return success;
      } catch (err) {
        const errorMessage =
          "Failed to stream large file from container: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial data loading
  useEffect(() => {
    // console.log("🚀 useEffect triggered at:", new Date().toISOString()); // 디버깅용 - 주석 처리

    const initialLoad = async () => {
      // console.log("📅 initialLoad started at:", new Date().toISOString()); // 디버깅용 - 주석 처리

      if (hasInitialized.current) {
        return; // 이미 초기화됨
      }

      // 🔒 전역 중복 실행 방지
      if (globalCleanupCompleted) {
        console.log(
          "⚡ Cleanup already completed globally, skipping at:",
          new Date().toISOString()
        );
        hasInitialized.current = true;
        await loadImages();
        await loadContainers();
        return;
      }

      try {
        hasInitialized.current = true;
        globalCleanupInProgress = true;

        // 🚀 즉시 실행: Docker API 직접 호출로 최대한 빠른 컨테이너 정지
        if (window.docker?.getContainers && window.docker?.stopContainer) {
          const currentContainers = await window.docker.getContainers();

          // 실행 중인 모든 컨테이너를 즉시 병렬 종료
          if (currentContainers.length > 0) {
            const stopPromises = currentContainers.map(async (container) => {
              try {
                await window.docker.stopContainer(container.ID);

                return { success: true, containerId: container.ID };
              } catch (stopError) {
                console.error(
                  `❌ IMMEDIATE: Failed to stop container ${container.ID}:`,
                  stopError
                );
                return {
                  success: false,
                  containerId: container.ID,
                  error: stopError,
                };
              }
            });

            // 병렬로 모든 컨테이너 정지 (더 빠름)
            const results = await Promise.all(stopPromises);
            const successful = results.filter((r) => r.success).length;
            const failed = results.filter((r) => !r.success).length;

            console.log(
              `🎉 IMMEDIATE stop completed: ${successful} stopped, ${failed} failed`
            );
          } else {
            // console.log("⚡ IMMEDIATE: No containers found to stop.");
          }
        } else {
          // console.log("⚠️ Docker API not available for immediate cleanup");
        }

        await loadImages();
        await loadContainers(); // 상태 업데이트

        // 정리 완료 표시
        globalCleanupCompleted = true;
        console.log("🔒 Global cleanup marked as completed");
      } catch (err) {
        console.error("Initial data loading error:", err);
        hasInitialized.current = false; // 에러 시 다시 시도할 수 있도록
        globalCleanupInProgress = false; // 에러 시 다시 시도할 수 있도록
      } finally {
        globalCleanupInProgress = false;
      }
    };

    initialLoad();
  }, []);

  const isContainerRunning = useMemo(
    () => !!dockerStatus.isContainerFromImageRunning,
    [dockerStatus]
  );
  return {
    // State
    images,
    containers,
    loading,
    error,
    currentDockerContainer,
    dockerStatus,
    isContainerRunning,
    dockerConfig,
    isDockerStatusLoading,
    // Actions
    loadImages,
    loadContainers,
    runContainer,
    stopContainer,
    executeCommand,
    executeCommandWithStreaming,
    downloadLargeFile,
    streamLargeFile,
    verifyDockerStatus,
    // State reset
    clearError: () => setError(null),
  };
};

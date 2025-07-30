import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  DockerImage,
  DockerContainer,
  currentDockerContainerAtom,
} from "../atoms/docker";
import { useAtom } from "jotai";
import { DOCKER_NAME, getDockerConfigForEnvironment } from "../constants";
import useCuda from "./useCuda";

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
      stopContainer: (containerId: string) => Promise<boolean>;
      executeCommand: (
        containerId: string,
        command: string[]
      ) => Promise<string>;
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
  const { cudaStatus } = useCuda();
  const hasInitialized = useRef(false);

  // Load environment-specific Docker configuration
  useEffect(() => {
    const loadDockerConfig = async () => {
      try {
        const config = await getDockerConfigForEnvironment();
        setDockerConfig(config);
        console.log("Loaded Docker config for environment:", config);
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
          options = ["--gpus", "all", ...options];
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
    const initialLoad = async () => {
      if (hasInitialized.current) {
        return; // 이미 초기화됨
      }

      try {
        hasInitialized.current = true;

        // 먼저 컨테이너 목록을 로드하여 실행 중인 타겟 컨테이너 확인
        const currentContainers = await loadContainers();

        console.log(`Found ${currentContainers.length} total containers`);

        // 실행 중인 모든 컨테이너를 종료 (간단한 접근)
        if (currentContainers.length > 0) {
          console.log(
            `Stopping all ${currentContainers.length} running container(s)...`
          );

          for (const container of currentContainers) {
            try {
              console.log(`Stopping container: ${container.ID}`);
              await stopContainer(container.ID);
              console.log(`Successfully stopped container: ${container.ID}`);
            } catch (stopError) {
              console.error(
                `Failed to stop container ${container.ID}:`,
                stopError
              );
            }
          }

          // console.log("All containers have been stopped.");
        } else {
          // console.log("No containers found to stop.");
        }

        await loadImages();
      } catch (err) {
        console.error("Initial data loading error:", err);
        hasInitialized.current = false; // 에러 시 다시 시도할 수 있도록
      }
    };

    initialLoad();
  }, [loadImages, loadContainers, stopContainer]);

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
    // Actions
    loadImages,
    loadContainers,
    runContainer,
    stopContainer,
    executeCommand,
    downloadLargeFile,
    streamLargeFile,
    verifyDockerStatus,
    // State reset
    clearError: () => setError(null),
  };
};

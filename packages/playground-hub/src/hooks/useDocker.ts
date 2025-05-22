import { useState, useEffect, useCallback } from "react";
import {
  DockerImage,
  DockerContainer,
  currentDockerContainerAtom,
} from "../atoms/docker";
import { useAtom } from "jotai";
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
      checkDockerStatus: () => Promise<{
        isInstalled: boolean;
        isRunning: boolean;
      }>;
    };
  }
}

export const useDocker = () => {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDockerContainer, setCurrentDockerContainer] = useAtom(
    currentDockerContainerAtom
  );
  const [dockerStatus, setDockerStatus] = useState<{
    isInstalled: boolean;
    isRunning: boolean;
  }>({ isInstalled: false, isRunning: false });

  // Docker 상태 체크
  const verifyDockerStatus = useCallback(async () => {
    try {
      const status = await window.docker.checkDockerStatus();
      setDockerStatus(status);
      return status;
    } catch (err) {
      console.error("Failed to check Docker status:", err);
      return { isInstalled: false, isRunning: false };
    }
  }, []);

  // 초기 로딩 시 Docker 상태 체크
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      await verifyDockerStatus();
    }, 3000); // 3초마다 체크

    return () => clearInterval(checkInterval);
  }, []);

  // Docker 관련 작업 전 상태 체크
  const ensureDockerReady = useCallback(async () => {
    const status = await verifyDockerStatus();
    if (!status.isInstalled || !status.isRunning) {
      throw new Error("Docker is not ready");
    }
  }, [verifyDockerStatus]);

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

  // Load container list
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
      await ensureDockerReady();
      if (!imageName) {
        const errorMessage = "Image name is required";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const options = [
        "-it", // -d 대신 -it 사용
        "--rm", // 종료 시 자동 삭제
        "-p",
        "8080:8080",
      ];
      setLoading(true);
      setError(null);
      try {
        const container = await window.docker.runContainer(imageName, options);

        if (container) {
          console.log("currentDockerContainer", container);
          setCurrentDockerContainer(container);
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
    [loadContainers, setCurrentDockerContainer]
  );

  // Stop container
  const stopContainer = useCallback(
    async (containerId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await window.docker.stopContainer(containerId);
        await loadContainers(); // Refresh container list
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
    [loadContainers]
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

  // Initial data loading
  useEffect(() => {
    const initialLoad = async () => {
      try {
        await Promise.all([loadImages(), loadContainers()]);
      } catch (err) {
        console.error("Initial data loading error:", err);
      }
    };

    initialLoad();
  }, [loadImages, loadContainers]);

  return {
    // State
    images,
    containers,
    loading,
    error,
    currentDockerContainer,

    // Actions
    loadImages,
    loadContainers,
    runContainer,
    stopContainer,
    executeCommand,
    // State reset
    clearError: () => setError(null),
  };
};

import { useState, useEffect, useCallback } from "react";
import {
  DockerImage,
  DockerContainer,
  currentDockerContainerAtom,
} from "../atoms/docker";
import { useAtom } from "jotai";

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
      checkDockerStatus: (
        imageNameToCheck?: string
      ) => Promise<DockerStatusCheckResult>;
    };
  }
}

// Add an optional parameter to the hook for the polling image name
export const useDocker = () => {
  const imageNameForPolling = "tokamak-zk-evm-demo";
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

  // Docker 상태 체크 (now accepts imageNameToCheck)
  const verifyDockerStatus = useCallback(async (imageNameToCheck?: string) => {
    try {
      const status = await window.docker.checkDockerStatus(imageNameToCheck);
      setDockerStatus(status);
      return status;
    } catch (err) {
      console.error("Failed to check Docker status:", err);
      const errorStatus = {
        isInstalled: dockerStatus.isInstalled,
        isRunning: false,
        imageExists: false,
        isContainerFromImageRunning: false,
      };
      setDockerStatus(errorStatus);
      return errorStatus;
    }
  }, []);

  // 초기 로딩 시 Docker 상태 체크 및 3초마다 반복 체크
  useEffect(() => {
    // Determine the image name to check.
    // Prioritize the explicitly passed imageNameForPolling.
    // Fallback to currentDockerContainer's image if imageNameForPolling is not provided.
    const imageName = imageNameForPolling;

    const performCheck = async () => {
      // verifyDockerStatus will handle an undefined imageName gracefully
      // (i.e., check general Docker status without image-specifics)
      await verifyDockerStatus(imageName);
    };

    performCheck(); // 초기 로딩 시 바로 체크
    const checkInterval = setInterval(performCheck, 3000); // 3초마다 체크

    return () => clearInterval(checkInterval);
    // Add imageNameForPolling to the dependency array
  }, [verifyDockerStatus, imageNameForPolling]);

  // Docker 관련 작업 전 상태 체크
  const ensureDockerReady = useCallback(async () => {
    // Use the same logic for determining imageName as in the polling useEffect
    const imageName = imageNameForPolling;
    const status = await verifyDockerStatus(imageName);
    if (!status.isInstalled || !status.isRunning) {
      throw new Error("Docker is not installed or not running.");
    }
    // Optionally, add checks based on the specific imageName if it's relevant for readiness
    // if (imageName && (!status.imageExists || !status.isContainerFromImageRunning)) {
    //   throw new Error(`Required Docker image ${imageName} is not running or does not exist.`);
    // }
  }, [verifyDockerStatus, imageNameForPolling]); // Added imageNameForPolling

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

      const options = ["-it", "--rm", "-p", "8080:8080"];
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
    [verifyDockerStatus, setCurrentDockerContainer, loadContainers]
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
          currentDockerContainer.id === containerId
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
    dockerStatus,
    // Actions
    loadImages,
    loadContainers,
    runContainer,
    stopContainer,
    executeCommand,
    verifyDockerStatus,
    // State reset
    clearError: () => setError(null),
  };
};

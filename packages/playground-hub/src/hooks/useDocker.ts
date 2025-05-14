import { useState, useEffect, useCallback } from "react";

export interface DockerImage {
  name: string;
  size: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  status: string;
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
    };
  }
}

export const useDocker = () => {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load image list
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dockerImages = await window.docker.getImages();
      console.log("dockerImages", dockerImages);
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
      console.log("dockerContainers", dockerContainers);
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
        await loadContainers(); // Refresh container list
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
    [loadContainers]
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

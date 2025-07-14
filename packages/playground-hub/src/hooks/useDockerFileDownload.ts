import { useState, useCallback } from "react";
import { useDocker } from "./useDocker";
import { electronSaveFileDialog } from "./useElectronSaveDialog";

export type SynthesizerFiles = {
  instance: string | null;
  permutation: string | null;
  placementVariables: string | null;
};

export type FileDownloadState = {
  isDownloading: boolean;
  error: string | null;
  files: SynthesizerFiles;
};

export const useDockerFileDownload = () => {
  const { executeCommand, currentDockerContainer } = useDocker();

  const [state, setState] = useState<FileDownloadState>({
    isDownloading: false,
    error: null,
    files: {
      instance: null,
      permutation: null,
      placementVariables: null,
    },
  });

  const downloadSynthesizerFiles = useCallback(async () => {
    if (!currentDockerContainer?.ID) {
      setState((prev) => ({
        ...prev,
        error: "Docker container not found. Please start the container first.",
      }));
      return null;
    }

    try {
      setState((prev) => ({ ...prev, isDownloading: true, error: null }));

      console.log("Downloading synthesizer files from Docker container...");

      // Define file paths in the container
      const filePaths = {
        instance: "frontend/synthesizer/examples/outputs/instance.json",
        permutation: "frontend/synthesizer/examples/outputs/permutation.json",
        placementVariables:
          "frontend/synthesizer/examples/outputs/placementVariables.json",
      };

      // Download each file
      const downloadPromises = Object.entries(filePaths).map(
        async ([key, path]) => {
          try {
            const fileContent = await executeCommand(
              currentDockerContainer.ID,
              ["cat", path]
            );
            return { key, content: fileContent };
          } catch (error) {
            console.warn(`Failed to download ${key} file from ${path}:`, error);
            return { key, content: null };
          }
        }
      );

      const results = await Promise.all(downloadPromises);

      // Build the files object
      const files: SynthesizerFiles = {
        instance: null,
        permutation: null,
        placementVariables: null,
      };

      results.forEach(({ key, content }) => {
        if (content) {
          files[key as keyof SynthesizerFiles] = content;
        }
      });

      console.log("Downloaded synthesizer files:", {
        hasInstance: !!files.instance,
        hasPermutation: !!files.permutation,
        hasPlacementVariables: !!files.placementVariables,
      });

      setState((prev) => ({
        ...prev,
        isDownloading: false,
        files,
      }));

      return files;
    } catch (error) {
      console.error("Error downloading synthesizer files:", error);
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
      return null;
    }
  }, [currentDockerContainer, executeCommand]);

  const downloadToLocal = useCallback(
    async (
      filename: string,
      content: string
    ): Promise<{
      filePath: string | null;
      success: boolean;
      error?: string;
    }> => {
      try {
        const result = await electronSaveFileDialog(filename, content);
        console.log(`Downloaded ${filename} to local machine`);
        return result;
      } catch (error) {
        console.error(`Failed to download ${filename}:`, error);
        return {
          filePath: null as string | null,
          success: false,
          error: error.message || "Unknown error",
        };
      }
    },
    []
  );

  const downloadAllFiles = useCallback(() => {
    const { instance, permutation, placementVariables } = state.files;

    if (instance) {
      downloadToLocal("instance.json", instance);
    }
    if (permutation) {
      downloadToLocal("permutation.json", permutation);
    }
    if (placementVariables) {
      downloadToLocal("placementVariables.json", placementVariables);
    }
  }, [state.files, downloadToLocal]);

  const clearFiles = useCallback(() => {
    setState((prev) => ({
      ...prev,
      files: {
        instance: null,
        permutation: null,
        placementVariables: null,
      },
      error: null,
    }));
  }, []);

  return {
    ...state,
    downloadSynthesizerFiles,
    downloadToLocal,
    downloadAllFiles,
    clearFiles,
  };
};

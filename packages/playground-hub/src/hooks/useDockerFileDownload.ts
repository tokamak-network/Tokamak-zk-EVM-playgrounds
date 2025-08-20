import { useState, useCallback } from "react";
import { useDocker } from "./useDocker";
import { electronSaveFileDialog } from "./useElectronSaveDialog";

export type SynthesizerFiles = {
  instance: string | null;
  permutation: string | null;
  placementVariables: string | null;
};

export type SetupFiles = {
  combinedSigna: string | null;
  sigmaPreprocess: string | null;
  sigmaVerify: string | null;
};

export type PreprocessFiles = {
  preprocess: string | null;
};

export type ProveFiles = {
  proof: string | null;
};

export type FileDownloadState = {
  isDownloading: boolean;
  error: string | null;
  files: SynthesizerFiles;
  setupFiles: SetupFiles;
  preprocessFiles: PreprocessFiles;
  proveFiles: ProveFiles;
};

export const useDockerFileDownload = () => {
  const {
    executeCommand,
    downloadLargeFile,
    streamLargeFile,
    currentDockerContainer,
  } = useDocker();

  const [state, setState] = useState<FileDownloadState>({
    isDownloading: false,
    error: null,
    files: {
      instance: null,
      permutation: null,
      placementVariables: null,
    },
    setupFiles: {
      combinedSigna: null,
      sigmaPreprocess: null,
      sigmaVerify: null,
    },
    preprocessFiles: {
      preprocess: null,
    },
    proveFiles: {
      proof: null,
    },
  });

  // Function to download very large files directly to local files
  const downloadVeryLargeFile = useCallback(
    async (
      containerId: string,
      containerFilePath: string,
      filename: string
    ) => {
      try {
        const result = await window.dockerFileDownloaderAPI.saveFile(
          filename,
          ""
        );
        if (result.filePath) {
          console.log(`Streaming large file to: ${result.filePath}`);
          const success = await streamLargeFile(
            containerId,
            containerFilePath,
            result.filePath
          );
          return { success, filePath: result.filePath };
        }
        return { success: false, error: "User cancelled" };
      } catch (error) {
        console.error("Failed to download very large file:", error);
        return { success: false, error: error.message || "Unknown error" };
      }
    },
    [streamLargeFile]
  );

  const downloadSynthesizerFiles = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isDownloading: true, error: null }));

      console.log("Downloading synthesizer files from local file system...");

      // Define file paths for binary-based execution
      const filePaths = {
        instance: "binaries/backend/resource/synthesizer/outputs/instance.json",
        permutation:
          "binaries/backend/resource/synthesizer/outputs/permutation.json",
        placementVariables:
          "binaries/backend/resource/synthesizer/outputs/placementVariables.json",
      };

      // Download each file from local file system
      const downloadPromises = Object.entries(filePaths).map(
        async ([key, path]) => {
          try {
            const fileContent = await window.binaryService.readFile(path);
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
  }, []);

  const downloadSetupFiles = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isDownloading: true, error: null }));

      console.log("Downloading setup files from local file system...");

      // Define file paths for binary-based execution
      const filePaths = {
        combinedSigna:
          "binaries/backend/resource/setup/output/combined_sigma.json",
        sigmaPreprocess:
          "binaries/backend/resource/setup/output/sigma_preprocess.json",
        sigmaVerify: "binaries/backend/resource/setup/output/sigma_verify.json",
      };

      // Download each file from local file system
      const downloadPromises = Object.entries(filePaths).map(
        async ([key, path]) => {
          try {
            console.log(`Downloading ${key} file from ${path}...`);
            const fileContent = await window.binaryService.readFile(path);
            console.log(
              `Successfully downloaded ${key} file (${fileContent.length} characters)`
            );
            return { key, content: fileContent };
          } catch (error) {
            console.warn(`Failed to download ${key} file from ${path}:`, error);
            return { key, content: null };
          }
        }
      );

      console.log("Waiting for all downloads to complete...");
      const results = await Promise.all(downloadPromises);
      console.log("All downloads completed, processing results...");

      // Build the setupFiles object
      const setupFiles: SetupFiles = {
        combinedSigna: null,
        sigmaPreprocess: null,
        sigmaVerify: null,
      };

      results.forEach(({ key, content }) => {
        console.log(`Processing result for ${key}:`, !!content);
        if (content) {
          setupFiles[key as keyof SetupFiles] = content;
        }
      });

      console.log("Downloaded setup files:", {
        hasCombinedSigna: !!setupFiles.combinedSigna,
        hasSigmaPreprocess: !!setupFiles.sigmaPreprocess,
        hasSigmaVerify: !!setupFiles.sigmaVerify,
      });

      setState((prev) => ({
        ...prev,
        isDownloading: false,
        setupFiles,
      }));

      return setupFiles;
    } catch (error) {
      console.error("Error downloading setup files:", error);
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
      return null;
    }
  }, []);

  const downloadPreprocessFiles = useCallback(async () => {
    setState((prev) => ({ ...prev, isDownloading: true, error: null }));

    try {
      console.log("Starting preprocess file download...");

      const filePath =
        "binaries/backend/resource/preprocess/output/preprocess.json";

      console.log(`Downloading preprocess file from: ${filePath}`);

      const content = await window.binaryService.readFile(filePath);

      if (!content) {
        console.error(`Failed to download preprocess file`);
        setState((prev) => ({
          ...prev,
          isDownloading: false,
          error: "Failed to download preprocess file",
        }));
        return null;
      }

      console.log("Preprocess file downloaded successfully");

      const preprocessFiles: PreprocessFiles = {
        preprocess: content,
      };

      setState((prev) => ({
        ...prev,
        isDownloading: false,
        preprocessFiles,
      }));

      return preprocessFiles;
    } catch (error) {
      console.error("Error downloading preprocess files:", error);
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
      return null;
    }
  }, []);

  const downloadProveFiles = useCallback(async () => {
    setState((prev) => ({ ...prev, isDownloading: true, error: null }));

    try {
      console.log("Starting prove file download...");

      const filePath = "binaries/backend/resource/prove/output/proof.json";

      console.log(`Downloading prove file from: ${filePath}`);

      const content = await window.binaryService.readFile(filePath);

      if (!content) {
        console.error(`Failed to download prove file`);
        setState((prev) => ({
          ...prev,
          isDownloading: false,
          error: "Failed to download prove file",
        }));
        return null;
      }

      console.log("Prove file downloaded successfully");

      const proveFiles: ProveFiles = {
        proof: content,
      };

      setState((prev) => ({
        ...prev,
        isDownloading: false,
        proveFiles,
      }));

      return proveFiles;
    } catch (error) {
      console.error("Error downloading prove files:", error);
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
      return null;
    }
  }, []);

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
      setupFiles: {
        combinedSigna: null,
        sigmaPreprocess: null,
        sigmaVerify: null,
      },
      preprocessFiles: {
        preprocess: null,
      },
      proveFiles: {
        proof: null,
      },
      error: null,
    }));
  }, []);

  return {
    ...state,
    downloadSynthesizerFiles,
    downloadSetupFiles,
    downloadPreprocessFiles,
    downloadProveFiles,
    downloadToLocal,
    downloadVeryLargeFile,
    downloadAllFiles,
    clearFiles,
  };
};

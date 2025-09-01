import { useState, useCallback } from "react";
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

export const useBinaryFileDownload = () => {
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

  // Function to read file from binary directory
  const readBinaryFile = useCallback(
    async (filePath: string): Promise<string | null> => {
      try {
        const content = await window.binaryService.readBinaryFile(filePath);
        return content;
      } catch (error) {
        console.error(`Failed to read file ${filePath}:`, error);
        return null;
      }
    },
    []
  );

  // Function to download large file directly without loading into memory
  const downloadLargeFileDirectly = useCallback(
    async (
      sourceFilePath: string,
      downloadFileName: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log(
          `Starting direct download of large file: ${sourceFilePath}`
        );

        // Show save dialog to let user choose location for large files
        const result =
          await window.dockerFileDownloaderAPI.showLargeFileSaveDialog(
            downloadFileName
          );

        if (!result.success) {
          console.log("User cancelled download or dialog failed");
          return { success: false, error: "Download cancelled" };
        }

        if (!result.filePath) {
          console.error("No file path returned from save dialog");
          return { success: false, error: "No file path selected" };
        }

        // Use system command to copy the file to the selected location
        const output = await window.binaryService.executeSystemCommand([
          "bash",
          "-c",
          `cp "${sourceFilePath}" "${result.filePath}"`,
        ]);

        console.log(
          `Successfully downloaded large file to: ${result.filePath}`
        );
        console.log("Copy command output:", output);
        return { success: true };
      } catch (error) {
        console.error(
          `Failed to download large file ${sourceFilePath}:`,
          error
        );
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    []
  );

  const downloadSynthesizerFiles = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isDownloading: true, error: null }));

      console.log("Downloading synthesizer files from binary directory...");

      // Define file paths in the binary directory
      const filePaths = {
        instance: "src/binaries/resource/synthesizer/outputs/instance.json",
        permutation:
          "src/binaries/resource/synthesizer/outputs/permutation.json",
        placementVariables:
          "src/binaries/resource/synthesizer/outputs/placementVariables.json",
      };

      // Download each file
      const downloadPromises = Object.entries(filePaths).map(
        async ([key, path]) => {
          try {
            const fileContent = await readBinaryFile(path);
            return { key, content: fileContent };
          } catch (error) {
            console.warn(`Failed to read ${key} file from ${path}:`, error);
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
  }, [readBinaryFile]);

  const downloadSetupFiles = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isDownloading: true, error: null }));

      console.log("Checking setup files from binary directory...");

      // Define file paths in the binary directory
      const filePaths = {
        combinedSigna: "src/binaries/resource/setup/output/combined_sigma.json",
        sigmaPreprocess:
          "src/binaries/resource/setup/output/sigma_preprocess.json",
        sigmaVerify: "src/binaries/resource/setup/output/sigma_verify.json",
      };

      // For setup files, we only read the small sigma_verify file
      // Large files (combinedSigna, sigmaPreprocess) will be handled by direct file operations
      const setupFiles: SetupFiles = {
        combinedSigna: null,
        sigmaPreprocess: null,
        sigmaVerify: null,
      };

      try {
        console.log("Reading sigma_verify file (small file)...");
        const sigmaVerifyContent = await readBinaryFile(filePaths.sigmaVerify);
        if (sigmaVerifyContent) {
          setupFiles.sigmaVerify = sigmaVerifyContent;
          console.log("Successfully read sigma_verify file");
        }
      } catch (error) {
        console.warn("Failed to read sigma_verify file:", error);
      }

      // For large files, we just mark them as available without loading into memory
      // The actual download will be handled by direct file copy operations
      console.log(
        "Marking large files as available (not loading into memory)..."
      );
      setupFiles.combinedSigna = "LARGE_FILE_AVAILABLE";
      setupFiles.sigmaPreprocess = "LARGE_FILE_AVAILABLE";

      console.log("Setup files check completed:", {
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
      console.error("Error checking setup files:", error);
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
      return null;
    }
  }, [readBinaryFile]);

  const downloadPreprocessFiles = useCallback(async () => {
    setState((prev) => ({ ...prev, isDownloading: true, error: null }));

    try {
      console.log("Starting preprocess file download...");

      const filePath =
        "src/binaries/resource/preprocess/output/preprocess.json";

      console.log(`Reading preprocess file from: ${filePath}`);

      const content = await readBinaryFile(filePath);

      if (!content) {
        console.error(`Failed to read preprocess file`);
        setState((prev) => ({
          ...prev,
          isDownloading: false,
          error: "Failed to read preprocess file",
        }));
        return null;
      }

      console.log("Preprocess file read successfully");

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
  }, [readBinaryFile]);

  const downloadProveFiles = useCallback(async () => {
    setState((prev) => ({ ...prev, isDownloading: true, error: null }));

    try {
      console.log("Starting prove file download...");

      const filePath = "src/binaries/resource/prove/output/proof.json";

      console.log(`Reading prove file from: ${filePath}`);

      const content = await readBinaryFile(filePath);

      if (!content) {
        console.error(`Failed to read prove file`);
        setState((prev) => ({
          ...prev,
          isDownloading: false,
          error: "Failed to read prove file",
        }));
        return null;
      }

      console.log("Prove file read successfully");

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
  }, [readBinaryFile]);

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
    downloadLargeFileDirectly,
    downloadAllFiles,
    clearFiles,
  };
};

declare global {
  interface Window {
    dockerFileDownloaderAPI: {
      saveFile: (
        defaultFileName: string,
        content: string
      ) => Promise<{
        filePath: string | null;
        success: boolean;
        error?: string;
      }>;
      showLargeFileSaveDialog: (defaultFileName: string) => Promise<{
        filePath: string | null;
        success: boolean;
        error?: string;
      }>;
    };
  }
}

export async function electronSaveFileDialog(
  defaultFileName: string,
  content: string
) {
  console.log("electronSaveFileDialog called with:", {
    defaultFileName,
    contentLength: content?.length,
  });

  if (
    window.dockerFileDownloaderAPI &&
    window.dockerFileDownloaderAPI.saveFile
  ) {
    try {
      console.log("Calling window.dockerFileDownloaderAPI.saveFile...");
      const result = await window.dockerFileDownloaderAPI.saveFile(
        defaultFileName,
        content
      );
      console.log("saveFile result:", result);

      if (result.success) {
        console.log(`File saved successfully to: ${result.filePath}`);
      } else {
        console.error(
          `Failed to save file: ${result.error || "Unknown error"}`
        );
      }
      return result;
    } catch (error) {
      console.error("Error in dockerFileDownloaderAPI.saveFile:", error);
      return {
        filePath: null as string | null,
        success: false,
        error: error.message || "Unknown error",
      };
    }
  } else {
    console.log("dockerFileDownloaderAPI not available, using fallback");
    // fallback: 브라우저 다운로드
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { filePath: null as string | null, success: true };
  }
}

import React, { useState } from "react";
import JsonIcon from "../assets/modals/json.svg";
import DownloadIcon from "../assets/modals/docker/download-button.svg";
import DownloadedIcon from "../assets/modals/docker/downloaded-button.svg";
import LoadingSpinner from "./common/LoadingSpinner";

export interface FileDownloadItemProps {
  fileName: string;
  isDownloading?: boolean;
  hasFile?: boolean;
  titleWidth?: string;
  onDownload: (
    filename: string
  ) => Promise<{ success: boolean; error?: string }>;
  onFetchFile?: () => Promise<string | null>;
}

const FileDownloadItem: React.FC<FileDownloadItemProps> = ({
  fileName,
  isDownloading = false,
  hasFile = false,
  titleWidth = "105px",
  onDownload,
  onFetchFile,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleClick = async () => {
    console.log("FileDownloadItem handleClick called:", {
      fileName,
      hasFile,
      onFetchFile: !!onFetchFile,
    });

    if (hasFile) {
      // 파일이 이미 있는 경우 바로 다운로드
      console.log("File exists, downloading directly...");
      setIsDialogOpen(true);
      const result = await onDownload(`${fileName}.json`);
      setIsDialogOpen(false);
      if (result && result.success) {
        setIsDownloaded(true);
      }
    } else if (onFetchFile) {
      // 파일을 먼저 가져와야 하는 경우
      console.log("File doesn't exist, fetching first...");
      setIsDialogOpen(true);
      const fileContent = await onFetchFile();
      if (fileContent) {
        const result = await onDownload(`${fileName}.json`);
        if (result && result.success) {
          setIsDownloaded(true);
        }
      }
      setIsDialogOpen(false);
    } else {
      // onFetchFile이 없으면 바로 onDownload 호출 (다운로드 핸들러에서 처리)
      console.log("No onFetchFile, calling onDownload directly...");
      setIsDialogOpen(true);
      const result = await onDownload(`${fileName}.json`);
      setIsDialogOpen(false);
      if (result && result.success) {
        setIsDownloaded(true);
      }
    }
  };

  const isDownloadingState = isDownloading || isDialogOpen;

  const getIcon = () => {
    if (isDownloadingState) {
      // 다운로드 준비중 또는 컨펌창 - 스피너 표시
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    } else if (isDownloaded) {
      return <img src={DownloadedIcon} alt="Downloaded" className="w-6 h-6" />;
    } else {
      return <img src={DownloadIcon} alt="Download" className="w-6 h-6" />;
    }
  };

  return (
    <div
      className="flex padding-[8px] items-center gap-[12px] flex-1 cursor-pointer hover:bg-gray-50 rounded h-[54px]"
      style={{
        display: "flex",
        padding: "8px",
        alignItems: "center",
        gap: "12px",
        flex: "1 0 0",
      }}
      onClick={handleClick}
    >
      <img src={JsonIcon} alt="JSON" className="w-6 h-6" />
      <span
        style={{
          color: "#333",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: 600,
          lineHeight: "normal",
          letterSpacing: "-0.32px",
          width: titleWidth,
          height: "40px",
          display: "flex",
          alignItems: "center",
          wordBreak: "break-word",
          overflow: "hidden",
        }}
      >
        {fileName}
      </span>
      <div className="ml-auto" style={{ flexShrink: 0 }}>
        {getIcon()}
      </div>
    </div>
  );
};

export default FileDownloadItem;

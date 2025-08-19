import React, { useMemo } from "react";
import FileDownloadItem from "../FileDownloadItem";
import { useBinaryFileDownload } from "../../hooks/useBinaryFileDownload";
import { useModals } from "../../hooks/useModals";
import ExitIcon from "../../assets/modals/docker/exit.svg";

const PreprocessResult: React.FC = () => {
  const {
    preprocessFiles,
    downloadPreprocessFiles,
    downloadToLocal,
    isDownloading,
  } = useBinaryFileDownload();

  const { activeModal, closeModal } = useModals();
  const isOpen = useMemo(
    () => activeModal === "preprocess-result",
    [activeModal]
  );

  const onClose = () => {
    closeModal();
  };

  // 다운로드 핸들러
  const handleDownloadPreprocess = async (filename: string) => {
    console.log("handleDownloadPreprocess called with:", filename);
    console.log(
      "preprocessFiles.preprocess exists:",
      !!preprocessFiles.preprocess
    );

    if (preprocessFiles.preprocess) {
      console.log("File exists in memory, downloading directly...");
      const result = await downloadToLocal(
        filename,
        preprocessFiles.preprocess
      );
      console.log("downloadToLocal result:", result);
      return result;
    }

    // 파일이 메모리에 없으면 바이너리 디렉토리에서 다운로드
    console.log("File not in memory, downloading from binary directory...");
    const files = await downloadPreprocessFiles();
    if (files?.preprocess) {
      const result = await downloadToLocal(filename, files.preprocess);
      console.log("downloadToLocal result:", result);
      return result;
    }

    return { success: false, error: "Failed to download preprocess file" };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div
        className="relative"
        style={{
          width: "412px",
          height: "212px",
          flexShrink: 0,
        }}
      >
        {/* 상단 가로 보더라인 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "12px",
            width: "388px",
            height: "6px",
            backgroundColor: "#365969",
            zIndex: 10,
          }}
        />

        {/* 하단 가로 보더라인 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "12px",
            width: "388px",
            height: "6px",
            backgroundColor: "#365969",
            zIndex: 10,
          }}
        />

        {/* 좌측 세로 보더라인 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "12px",
            width: "6px",
            height: "194px",
            backgroundColor: "#365969",
            flexShrink: 0,
            zIndex: 10,
          }}
        />

        {/* 우측 세로 보더라인 */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "12px",
            width: "6px",
            height: "194px",
            backgroundColor: "#365969",
            flexShrink: 0,
            zIndex: 10,
          }}
        />

        {/* 네 모서리의 안쪽 벡터 (6x6 크기) */}
        {/* 좌상단 */}
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "6px",
            width: "6px",
            height: "6px",
            backgroundColor: "#365969",
            zIndex: 10,
          }}
        />

        {/* 우상단 */}
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "6px",
            height: "6px",
            backgroundColor: "#365969",
            zIndex: 10,
          }}
        />

        {/* 좌하단 */}
        <div
          style={{
            position: "absolute",
            bottom: "6px",
            left: "6px",
            width: "6px",
            height: "6px",
            backgroundColor: "#365969",
            zIndex: 10,
          }}
        />

        {/* 우하단 */}
        <div
          style={{
            position: "absolute",
            bottom: "6px",
            right: "6px",
            width: "6px",
            height: "6px",
            backgroundColor: "#365969",
            zIndex: 10,
          }}
        />

        {/* 헤더 영역 */}
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "6px",
            width: "400px",
            height: "46px",
            flexShrink: 0,
            backgroundColor: "#00CCEC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "16px",
            paddingRight: "16px",
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: "#1E1E1E",
              fontFamily: "'Jersey 10', cursive, sans-serif",
              fontSize: "26px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
              letterSpacing: "0.26px",
            }}
          >
            Preprocess result files
          </span>

          {/* Close 버튼 */}
          <div
            onClick={onClose}
            style={{
              width: "18px",
              height: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={ExitIcon}
              alt="Close"
              style={{
                width: "18px",
                height: "18px",
              }}
            />
          </div>
        </div>

        {/* 헤더 밑 라인 */}
        <div
          style={{
            position: "absolute",
            top: "52px",
            left: "6px",
            width: "400px",
            height: "6px",
            flexShrink: 0,
            backgroundColor: "#C2F7FF",
            zIndex: 1,
          }}
        />

        {/* 콘텐츠 영역 */}
        <div
          style={{
            position: "absolute",
            top: "58px",
            left: "6px",
            width: "400px",
            backgroundColor: "#ffffff",
            padding: "16px 24px",
            boxSizing: "border-box",
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: "#111",
              textAlign: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "23px",
              letterSpacing: "-0.32px",
              marginBottom: "16px",
              width: "100%",
              whiteSpace: "nowrap",
            }}
          >
            Files generated successfully.
            <br />
            You can now download the output files.
          </div>

          {/* 다운로드 파일 아이템 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <FileDownloadItem
              fileName="Verifier preprocess"
              titleWidth="250px"
              hasFile={!!preprocessFiles.preprocess}
              isDownloading={isDownloading}
              onDownload={handleDownloadPreprocess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreprocessResult;

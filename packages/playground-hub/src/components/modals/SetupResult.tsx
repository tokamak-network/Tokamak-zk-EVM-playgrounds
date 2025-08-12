import React, { useMemo } from "react";
import FileDownloadItem from "../FileDownloadItem";
import { useBinaryFileDownload } from "../../hooks/useBinaryFileDownload";
import { useModals } from "../../hooks/useModals";
import ExitIcon from "../../assets/modals/docker/exit.svg";

const SetupResult: React.FC = () => {
  const {
    setupFiles,
    downloadSetupFiles,
    downloadToLocal,
    downloadLargeFileDirectly,
  } = useBinaryFileDownload();

  const { activeModal, closeModal } = useModals();
  const isOpen = useMemo(() => activeModal === "setup-result", [activeModal]);

  const onClose = () => {
    closeModal();
  };

  // 각 파일별 다운로드 핸들러
  const handleDownloadCombinedSigna = async (filename: string) => {
    console.log("handleDownloadCombinedSigna called with:", filename);
    console.log("setupFiles.combinedSigna exists:", !!setupFiles.combinedSigna);

    // combinedSigna is a large file (1.5GB), use direct file copy
    console.log("Large file detected, using direct download...");
    const sourceFilePath =
      "src/binaries/backend/resource/setup/output/combined_sigma.json";
    const result = await downloadLargeFileDirectly(sourceFilePath, filename);
    console.log("downloadLargeFileDirectly result:", result);
    return result;
  };

  const handleDownloadSigmaPreprocess = async (filename: string) => {
    console.log("handleDownloadSigmaPreprocess called with:", filename);
    console.log(
      "setupFiles.sigmaPreprocess exists:",
      !!setupFiles.sigmaPreprocess
    );

    // sigmaPreprocess is also a large file (492MB), use direct file copy
    console.log("Large file detected, using direct download...");
    const sourceFilePath =
      "src/binaries/backend/resource/setup/output/sigma_preprocess.json";
    const result = await downloadLargeFileDirectly(sourceFilePath, filename);
    console.log("downloadLargeFileDirectly result:", result);
    return result;
  };

  const handleDownloadSigmaVerify = async (filename: string) => {
    console.log("handleDownloadSigmaVerify called with:", filename);
    console.log("setupFiles.sigmaVerify exists:", !!setupFiles.sigmaVerify);

    if (setupFiles.sigmaVerify) {
      console.log("File exists in memory, downloading directly...");
      const result = await downloadToLocal(filename, setupFiles.sigmaVerify);
      console.log("downloadToLocal result:", result);
      return result;
    }
    // 파일이 없으면 먼저 다운로드 시도
    console.log("File not in memory, fetching from binary directory...");
    const files = await downloadSetupFiles();
    console.log("downloadSetupFiles completed, result:", files);

    if (files && files.sigmaVerify) {
      console.log(
        "Successfully fetched sigmaVerify file from binary directory, downloading..."
      );
      const result = await downloadToLocal(filename, files.sigmaVerify);
      console.log("downloadToLocal result:", result);
      return result;
    }
    console.error("Failed to get sigmaVerify file from binary directory");
    return { success: false, error: "File not available" };
  };

  // 다운로드 아이템 배열 생성
  const downloadItems = [
    {
      fileName: "Common reference string (full version)",
      hasFile: !!setupFiles.combinedSigna,
      onDownload: handleDownloadCombinedSigna,
    },
    {
      fileName: "Common reference string (trimmed for Preprocess)",
      hasFile: !!setupFiles.sigmaPreprocess,
      onDownload: handleDownloadSigmaPreprocess,
    },
    {
      fileName: "Common reference string (trimmed for Verify)",
      hasFile: !!setupFiles.sigmaVerify,
      onDownload: handleDownloadSigmaVerify,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div
        className="relative"
        style={{
          width: "412px",
          height: "336px", // 높이를 늘려서 3개 항목 수용
          flexShrink: 0,
        }}
      >
        {/* 상단 가로 보더라인 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "12px", // 6px + 6px (왼쪽 모서리 비워두기)
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
            left: "12px", // 6px + 6px (왼쪽 모서리 비워두기)
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
            top: "12px", // 6px + 6px (상단 모서리 비워두기)
            width: "6px",
            height: "318px", // 높이 조정
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
            top: "12px", // 6px + 6px (상단 모서리 비워두기)
            width: "6px",
            height: "318px", // 높이 조정
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
            Setup result files
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
            top: "52px", // 헤더 높이(46px) + 헤더 시작점(6px)
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
            top: "58px", // 헤더(46px) + 헤더 시작점(6px) + 헤더 밑 라인(6px)
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

          {/* 다운로드 파일 아이템들 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {downloadItems.map((item, index) => (
              <FileDownloadItem
                key={index}
                fileName={item.fileName}
                titleWidth="250px"
                hasFile={item.hasFile}
                onDownload={item.onDownload}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupResult;

import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import FileDownloadItem from "../FileDownloadItem";
import { electronSaveFileDialog } from "../../hooks/useElectronSaveDialog";

const SetupResult: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(() => activeModal === "setup-result", [activeModal]);

  const onClose = () => {
    setActiveModal("none");
  };

  // 다운로드 핸들러 함수
  const handleDownload = async (filename: string) => {
    try {
      // 실제 파일 내용을 가져오는 로직이 필요합니다
      // 현재는 더미 데이터를 사용합니다
      const dummyContent = JSON.stringify(
        { message: "Setup result file content" },
        null,
        2
      );
      const result = await electronSaveFileDialog(filename, dummyContent);
      return result;
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error);
      return { success: false, error: error.message || "Unknown error" };
    }
  };

  // if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div
        className="relative"
        style={{
          width: "412px",
          height: "218px",
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
            top: "12px", // 6px + 6px (상단 모서리 비워두기)
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
            paddingLeft: "16px",
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
            height: "154px", // 전체 높이(218px) - 상단 여백(6px) - 헤더(46px) - 헤더 밑 라인(6px) - 하단 여백(6px)
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
          <div>
            <FileDownloadItem
              fileName="Common reference string (full version)"
              titleWidth="214px"
              hasFile={true}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupResult;

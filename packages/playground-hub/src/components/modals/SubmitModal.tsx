import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import SubmitModalImage from "../../assets/modals/submit/submit-modal.png";
import { useResetStage } from "../../hooks/useResetStage";
import { useDockerFileDownload } from "../../hooks/useDockerFileDownload";
import { useDocker } from "../../hooks/useDocker";
import { useBenchmark } from "../../hooks/useBenchmark";
import JSZip from "jszip";

const SubmitModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(() => activeModal === "submit", [activeModal]);
  const { initializeWithNewTransaction } = useResetStage();

  const { proveFiles, downloadProveFiles, downloadToLocal } =
    useDockerFileDownload();
  const { currentDockerContainer } = useDocker();
  const {
    downloadBenchmarkData,
    isSessionActive,
    currentSession,
    generateBenchmarkData,
  } = useBenchmark();

  const onClose = () => {
    initializeWithNewTransaction();
    setActiveModal("none");
  };

  // Proof 다운로드 핸들러
  const handleDownloadProof = async () => {
    console.log("handleDownloadProof called from SubmitModal");
    console.log("proveFiles.proof exists:", !!proveFiles.proof);

    if (proveFiles.proof) {
      console.log("File exists in memory, downloading directly...");
      const result = await downloadToLocal("proof.json", proveFiles.proof);
      console.log("downloadToLocal result:", result);
      return result;
    }

    // 파일이 메모리에 없으면 Docker에서 다운로드
    console.log("File not in memory, downloading from Docker...");
    if (!currentDockerContainer?.ID) {
      console.error("Docker container not found");
      return { success: false, error: "Docker container not found" };
    }

    const files = await downloadProveFiles();
    if (files?.proof) {
      const result = await downloadToLocal("proof.json", files.proof);
      console.log("downloadToLocal result:", result);
      return result;
    }

    return { success: false, error: "Failed to download proof file" };
  };

  // 벤치마크 데이터 다운로드 핸들러
  const handleDownloadBenchmark = () => {
    if (!isSessionActive || !currentSession) {
      console.warn("No active benchmark session to download");
      return;
    }

    console.log("Downloading benchmark data...");
    downloadBenchmarkData();
  };

  // Proof와 벤치마크를 합친 압축 파일 다운로드 핸들러
  const handleDownloadCombined = async () => {
    console.log("Creating combined zip file...");

    try {
      // 1. Proof 파일 가져오기
      let proofData: string | null = null;

      if (proveFiles.proof) {
        proofData = proveFiles.proof;
        console.log("Using proof from memory");
      } else if (currentDockerContainer?.ID) {
        const files = await downloadProveFiles();
        if (files?.proof) {
          proofData = files.proof;
          console.log("Downloaded proof from Docker");
        }
      }

      if (!proofData) {
        console.error("No proof data available");
        return { success: false, error: "No proof data available" };
      }

      // 2. 벤치마크 데이터 가져오기
      const benchmarkData = generateBenchmarkData();
      if (!benchmarkData) {
        console.error("No benchmark data available");
        return { success: false, error: "No benchmark data available" };
      }

      // 3. 압축 파일 생성
      const zip = new JSZip();

      // Proof 파일 추가
      zip.file("proof.json", proofData);

      // 벤치마크 파일 추가
      const benchmarkJson = JSON.stringify(benchmarkData, null, 2);
      zip.file("benchmark.json", benchmarkJson);

      // 4. 압축 파일 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tokamak_result_${benchmarkData.sessionId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      console.log("📦 Combined zip file downloaded successfully");

      return { success: true };
    } catch (error) {
      console.error("Failed to create combined zip file:", error);
      return { success: false, error: String(error) };
    }
  };

  // 벤치마크 데이터가 있는지 확인 (prove 프로세스가 완료되었는지)
  const hasBenchmarkData = currentSession?.processes.prove?.success;

  // if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <img
          src={SubmitModalImage}
          alt={"error-modal"}
          style={{
            width: "460px",
            marginTop: "10px",
          }}
        ></img>
        <div
          className="absolute w-[188px] h-[48px] top-[241px] left-[30px] cursor-pointer"
          onClick={handleDownloadCombined}
        ></div>
        <div
          className="absolute w-[188px] h-[48px] top-[241px] right-[30px] cursor-pointer"
          onClick={async () => {
            const url =
              "https://docs.google.com/forms/d/e/1FAIpQLSdVqGLRSrO2JhR0apXe5MzrUM9WdQZLJQTpnfd0hiUoNmNESw/viewform";

            console.log("📝 Opening Google Form in external browser...");
            try {
              const result = await window.electron.openExternalUrl(url);
              console.log("🌐 openExternalUrl result:", result);
              if (!result.success) {
                console.error("Failed to open external URL:", result.error);
              }
            } catch (error) {
              console.error("Error calling openExternalUrl:", error);
            }
          }}
        ></div>
        {/* 벤치마크 다운로드 버튼 - prove 프로세스가 완료된 경우에만 표시 */}
        {hasBenchmarkData && (
          <div
            className="absolute w-[188px] h-[48px] top-[300px] left-[136px] cursor-pointer rounded-lg flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:scale-105"
            onClick={handleDownloadCombined}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            📦 Download All
          </div>
        )}
        <div
          className="absolute w-[18px] h-[18px] top-[30px] right-[22px] cursor-pointer"
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
};

export default SubmitModal;

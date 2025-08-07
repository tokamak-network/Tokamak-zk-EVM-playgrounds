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

  const {
    proveFiles,
    files,
    downloadProveFiles,
    downloadToLocal,
    downloadSynthesizerFiles,
  } = useDockerFileDownload();
  const { currentDockerContainer } = useDocker();
  const { currentSession, generateBenchmarkData } = useBenchmark();

  const onClose = () => {
    initializeWithNewTransaction();
    setActiveModal("none");
  };

  // Combined download handler for proof and benchmark files
  const handleDownloadCombined = async () => {
    console.log("Creating combined zip file...");

    try {
      // 1. Get proof file
      let proofData: string | null = null;
      let instanceData: string | null = null;

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

      // 2. Get instance file
      if (files.instance) {
        instanceData = files.instance;
        console.log("Using instance from memory");
      } else if (currentDockerContainer?.ID) {
        const files = await downloadSynthesizerFiles();
        if (files?.instance) {
          instanceData = files.instance;
          console.log("Downloaded instance from Docker");
        }
      }

      if (!instanceData) {
        console.error("No instance data available");
        return { success: false, error: "No instance data available" };
      }

      // 3. Get benchmark data
      const benchmarkData = generateBenchmarkData();
      if (!benchmarkData) {
        console.error("No benchmark data available");
        return { success: false, error: "No benchmark data available" };
      }

      // 4. Create zip file
      const zip = new JSZip();

      // Add proof file
      zip.file("proof.json", proofData);

      // Add instance file
      zip.file("instance.json", instanceData);

      // Add benchmark file
      const benchmarkJson = JSON.stringify(benchmarkData, null, 2);
      zip.file("benchmark.json", benchmarkJson);

      // 5. Download zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tokamak-zk-evm-proof.zip`;
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

  // Check if benchmark data exists (prove process completed)
  const hasBenchmarkData = currentSession?.processes.prove?.success;

  if (!isOpen) return null;

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

import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import SubmitModalImage from "../../assets/modals/submit/submit-modal.png";
import { useResetStage } from "../../hooks/useResetStage";
import { useDockerFileDownload } from "../../hooks/useDockerFileDownload";
import { useDocker } from "../../hooks/useDocker";

const SubmitModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(() => activeModal === "submit", [activeModal]);
  const { initializeWithNewTransaction } = useResetStage();

  const { proveFiles, downloadProveFiles, downloadToLocal } =
    useDockerFileDownload();
  const { currentDockerContainer } = useDocker();

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
          onClick={handleDownloadProof}
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
        <div
          className="absolute w-[18px] h-[18px] top-[30px] right-[22px] cursor-pointer"
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
};

export default SubmitModal;

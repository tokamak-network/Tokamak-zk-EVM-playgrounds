import React, { useMemo } from "react";
import TransactionInputModalImage from "../../assets/modals/docker/docker-modal.png";
import DownloadButtonImage from "../../assets/modals/docker/download-button.png";
import PauseIconImage from "../../assets/modals/docker/pause.png";
import DownloadedImage from "../../assets/modals/docker/run-button.png";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import useElectronFileDownloader from "../../hooks/useFileDownload";
import { useTokamakZkEVMActions } from "../../hooks/useTokamakZkEVMActions";
import { useModals } from "../../hooks/useModals";
import { useDocker } from "../../hooks/useDocker";

const DockerModal: React.FC = () => {
  const {
    startDownloadAndLoad,
    downloadProgress,
    loadStatus,
    isProcessing: isDownloading,
  } = useElectronFileDownloader();

  const { setupEvmSpec } = useTokamakZkEVMActions();
  const { updateActiveSection } = usePipelineAnimation();
  const { activeModal, closeModal } = useModals();
  const { dockerStatus } = useDocker();

  const isDockerImageDownloaded = useMemo(() => {
    return dockerStatus.imageExists;
  }, [dockerStatus]);

  const startProcess = () => {
    try {
      setupEvmSpec();
      updateActiveSection("evm-to-qap");
    } catch (error) {
      console.error(error);
      // setActiveSection("none");
    } finally {
      closeModal();
    }
  };

  const onClickStartProcess = () => {
    if (isDownloading) {
      return;
    }
    if (isDockerImageDownloaded) {
      return startProcess();
    }
    const fileUrl =
      "https://pub-30801471f84a46049e31eea6c3395e00.r2.dev/docker-images/tokamak-zk-evm-tontransfer.tar"; // 실제 R2 파일 URL
    const desiredFilename = "tokamak-zk-evm-tontransfer.tar";

    startDownloadAndLoad(fileUrl, desiredFilename);
  };

  const isOpen = useMemo(() => activeModal === "docker-select", [activeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative w-[400px] h-[46px]">
        <div
          className="absolute w-[18px] h-[18px] top-[20px] left-[372px] cursor-pointer"
          onClick={closeModal}
        ></div>
        <img
          className="w-[412px h-[198px]"
          src={TransactionInputModalImage}
          alt={"transaction-input-modal"}
        ></img>
        <div
          className={`absolute ${isDownloading ? "top-[88px]" : "top-[95px]"} left-[90px] w-[292px] text-[16px] font-[600] flex flex-col items-center justify-between ${
            isDownloading ? "row-gap-[7px]" : "row-gap-[0px]"
          }`}
          style={{
            background: "white",
          }}
        >
          <div className="w-full h-[24px] flex  items-center justify-between">
            <span className="cursor-pointer">TOKAMAK-ZK-EVM</span>
            <img
              className={`cursor-pointer ${
                isDockerImageDownloaded
                  ? "w-[57px] h-[24px]"
                  : isDownloading
                    ? "w-[10px] h-[10px]"
                    : "w-[24px] h-[24px]"
              }`}
              src={
                isDockerImageDownloaded
                  ? DownloadedImage
                  : isDownloading
                    ? PauseIconImage
                    : DownloadButtonImage
              }
              onClick={onClickStartProcess}
            ></img>
          </div>
          {isDownloading && (
            <div
              className="w-full bg-gray-200 rounded-full h-[4px] mt-[7px]"
              style={{
                backgroundColor: "#DEDEDE",
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${downloadProgress.percentage}%`,
                  backgroundColor: "#F43DE3",
                }}
              ></div>
            </div>
          )}
        </div>
        <div
          className="absolute top-[94px] left-[358px] flex justify-center items-center h-[30px]"
          style={{
            background: "white",
          }}
        ></div>
      </div>
    </div>
  );
};

export default DockerModal;

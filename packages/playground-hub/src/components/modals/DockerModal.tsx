import React, { useMemo } from "react";
import TransactionInputModalImage from "../../assets/modals/docker/docker-modal.png";
import DownloadButtonImage from "../../assets/modals/docker/download-button.png";
import PauseIconImage from "../../assets/modals/docker/pause.png";
import DownloadedImage from "../../assets/modals/docker/run-button.png";
import DockerImage from "../../assets/images/docker.svg";
import RunningImage from "../../assets/images/running.svg";
import PauseImage from "../../assets/modals/docker/paused.svg";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import useElectronFileDownloader from "../../hooks/useFileDownload";
import { useTokamakZkEVMActions } from "../../hooks/useTokamakZkEVMActions";
import { useModals } from "../../hooks/useModals";
import { useDocker } from "../../hooks/useDocker";
import { DOCKER_DOWNLOAD_URL, FILE_NAME } from "../../constants";

const DockerModal: React.FC = () => {
  const {
    startDownloadAndLoad,
    downloadProgress,
    loadStatus,
    isPaused,
    isProcessing: isDownloading,
    pauseDownload,
    resumeDownload,
  } = useElectronFileDownloader();

  const { setupEvmSpec } = useTokamakZkEVMActions();
  const { updateActiveSection } = usePipelineAnimation();
  const { activeModal, closeModal } = useModals();
  const { dockerStatus, isContainerRunning } = useDocker();

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
    if (isPaused) {
      return resumeDownload();
    }
    if (isDownloading) {
      return pauseDownload();
    }
    if (isDockerImageDownloaded) {
      return startProcess();
    }
    const fileUrl = DOCKER_DOWNLOAD_URL; // 실제 R2 파일 URL
    const desiredFilename = FILE_NAME;

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
          className={`absolute top-[68px] left-[16px] w-[368px] h-[64px] px-[10px] text-[16px] font-[600] flex flex-col items-center justify-between ${
            isDownloading ? "row-gap-[7px]" : "row-gap-[0px]"
          } rounded-[10px]`}
          style={{
            background: isContainerRunning ? "#ECFCFE" : "white",
          }}
        >
          <div className="w-full h-full  flex  items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <img src={DockerImage} alt="docker-image" />
              <span className="cursor-pointer">TOKAMAK-ZK-EVM</span>
            </div>
            <img
              className={`cursor-pointer ${
                isPaused
                  ? "w-[14px] h-[14px]"
                  : isContainerRunning
                    ? "w-[82px] h-[24px]"
                    : isDockerImageDownloaded
                      ? "w-[57px] h-[24px]"
                      : isDownloading
                        ? "w-[10px] h-[10px]"
                        : "w-[24px] h-[24px]"
              }`}
              src={
                isPaused
                  ? PauseImage
                  : isContainerRunning
                    ? RunningImage
                    : isDockerImageDownloaded
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

import React, { useMemo, useEffect, useRef } from "react";
import TransactionInputModalImage from "../../assets/modals/docker/docker-modal.png";
import DownloadButtonImage from "../../assets/modals/docker/download-button.png";
import PauseIconImage from "../../assets/modals/docker/pause.png";
import DownloadedImage from "../../assets/modals/docker/run-button.png";
import DockerImage from "../../assets/images/docker.svg";
import RunningImage from "../../assets/images/running.svg";
import PauseImage from "../../assets/modals/docker/paused.svg";
import useElectronFileDownloader from "../../hooks/useFileDownload";
import { useTokamakZkEVMActions } from "../../hooks/useTokamakZkEVMActions";
import { useModals } from "../../hooks/useModals";
import { useDocker } from "../../hooks/useDocker";
import { DOCKER_DOWNLOAD_URL, FILE_NAME } from "../../constants";
import LoadingSpinner from "../common/LoadingSpinner";

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
  const { activeModal, closeModal } = useModals();
  const {
    dockerStatus,
    isContainerRunning,
    dockerConfig,
    isDockerStatusLoading,
    verifyDockerStatus,
  } = useDocker();

  // 이전 상태를 기억하여 깜빡임 방지
  const lastKnownImageState = useRef<boolean>(false);
  const lastKnownContainerState = useRef<boolean>(false);

  const isDockerImageDownloaded = useMemo(() => {
    // Docker 상태 로딩이 완료된 경우에만 상태 업데이트
    if (!isDockerStatusLoading) {
      const newState = dockerStatus.imageExists;
      if (lastKnownImageState.current !== newState) {
        lastKnownImageState.current = newState;
      }
      return newState;
    }

    // 로딩 중일 때는 마지막으로 알려진 상태 유지

    return lastKnownImageState.current;
  }, [dockerStatus, isDockerStatusLoading]);

  const stableIsContainerRunning = useMemo(() => {
    // Docker 상태 로딩이 완료된 경우에만 상태 업데이트
    if (!isDockerStatusLoading) {
      lastKnownContainerState.current = isContainerRunning;
      return isContainerRunning;
    }

    // 로딩 중일 때는 마지막으로 알려진 상태 유지
    return lastKnownContainerState.current;
  }, [isContainerRunning, isDockerStatusLoading]);

  // Docker 이미지 로딩 완료 시 상태 재확인
  useEffect(() => {
    if (loadStatus.stage === "completed") {
      console.log("Docker image loading completed, verifying status...");
      // 잠시 후 상태 체크 (Docker 상태 반영 시간 고려)
      const timer = setTimeout(() => {
        verifyDockerStatus(dockerConfig?.imageName);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loadStatus.stage, verifyDockerStatus, dockerConfig?.imageName]);

  const startProcess = () => {
    try {
      setupEvmSpec();
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

    // Use environment-specific Docker config
    const fileUrl = dockerConfig?.downloadUrl || DOCKER_DOWNLOAD_URL;
    const desiredFilename = dockerConfig?.fileName || FILE_NAME;

    console.log("Downloading Docker image with config:", {
      tag: dockerConfig?.tag,
      url: fileUrl,
      filename: desiredFilename,
    });

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
            background: stableIsContainerRunning ? "#ECFCFE" : "white",
          }}
        >
          <div className="w-full h-full  flex  items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <img src={DockerImage} alt="docker-image" />
              <span className="cursor-pointer">TOKAMAK-ZK-EVM</span>
            </div>
            {isDockerStatusLoading ? (
              <div className="w-[24px] h-[24px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : isDownloading && loadStatus.stage !== "downloading" ? (
              // 다운로드 완료 후 압축 해제 및 도커 로딩 중 - 스피너 표시
              <div className="w-[24px] h-[24px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <img
                className={`cursor-pointer ${
                  isPaused
                    ? "w-[14px] h-[14px]"
                    : stableIsContainerRunning
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
                    : stableIsContainerRunning
                      ? RunningImage
                      : isDockerImageDownloaded
                        ? DownloadedImage
                        : isDownloading
                          ? PauseIconImage
                          : DownloadButtonImage
                }
                onClick={onClickStartProcess}
              />
            )}
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

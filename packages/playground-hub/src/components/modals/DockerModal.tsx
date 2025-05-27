import React, { useEffect, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import TransactionInputModalImage from "../../assets/modals/docker/docker-modal.png";
import DownloadButtonImage from "../../assets/modals/docker/download-button.png";
import PauseIconImage from "../../assets/modals/docker/pause.svg";
import {
  etherscanApiKeyAtom,
  transactionBytecodeAtom,
  transactionHashAtom,
} from "../../atoms/api";
import { useDebouncedEtherscanValidation } from "../../hooks/useEtherscanApi";
import { useDebouncedTxHashValidation } from "../../hooks/useTransaction";
import { fetchTransactionBytecode } from "../../utils/parseTransaction";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import useElectronFileDownloader from "../../hooks/useFileDownload";

const DockerModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const apiKey = useAtomValue(etherscanApiKeyAtom);
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const setTransactionBytecode = useSetAtom(transactionBytecodeAtom);
  const { setActiveSection } = usePipelineAnimation();
  const {
    startDownloadAndLoad,
    downloadProgress,
    loadStatus,
    isProcessing: isDownloading,
  } = useElectronFileDownloader();
  // API 키 입력 핸들러
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransactionHash(value);
  };

  const { isValid: isValidApiKey } = useDebouncedEtherscanValidation(apiKey);
  const { isValid: isValidTxHash } =
    useDebouncedTxHashValidation(transactionHash);

  const handleStartProcess = () => {
    console.log("go");
    const fileUrl =
      "https://pub-0701c5cdd79d4abda56fd836761eab4c.r2.dev/tokamak-zk-evm-docker-image/tokamak-zk-evm-demo.tar"; // 실제 R2 파일 URL
    const desiredFilename = "tokamak-zk-evm-demo-image.tar";

    startDownloadAndLoad(fileUrl, desiredFilename);
  };

  const onClose = () => {
    setActiveModal("none");
  };

  const isOpen = useMemo(() => activeModal === "docker-select", [activeModal]);

  const isActive = useMemo(() => {
    return isValidApiKey && isValidTxHash;
  }, [isValidApiKey, isValidTxHash]);

  const errorMessage = useMemo(() => {
    if (!isValidApiKey) return "Invalid API key. Update in settings.";
    if (!isValidTxHash && transactionHash.length > 0)
      return "Invalid transaction ID. Please verify.";
    return null;
  }, [isValidApiKey, isValidTxHash]);

  useEffect(() => {
    fetchTransactionBytecode(transactionHash);
  }, [transactionHash]);

  //   if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center ">
      <div className="relative w-[400px] h-[46px]">
        <div
          className="absolute w-[18px] h-[18px] top-[20px] left-[372px] cursor-pointer"
          onClick={onClose}
        ></div>
        <img
          src={TransactionInputModalImage}
          alt={"transaction-input-modal"}
        ></img>
        <div
          className={`absolute ${isDownloading ? "top-[88px]" : "top-[95px]"} left-[88px] w-[293px] text-[16px] font-[600] flex flex-col items-center justify-between ${
            isDownloading ? "row-gap-[7px]" : "row-gap-[0px]"
          }`}
          style={{
            background: "white",
          }}
        >
          <div className="w-full h-[24px] flex  items-center justify-between">
            <span>TOKAMAK-ZK-EVM</span>
            <img
              className="cursor-pointer"
              src={isDownloading ? PauseIconImage : DownloadButtonImage}
              onClick={handleStartProcess}
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
        <div>gogo</div>
      </div>
    </div>
  );
};

export default DockerModal;

import React, { useEffect, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import TransactionInputModalImage from "../../assets/modals/docker/docker-modal.png";
import DownloadButtonImage from "../../assets/modals/docker/download-button.png";
import {
  etherscanApiKeyAtom,
  transactionBytecodeAtom,
  transactionHashAtom,
} from "../../atoms/api";
import { useDebouncedEtherscanValidation } from "../../hooks/useEtherscanApi";
import { useDebouncedTxHashValidation } from "../../hooks/useTransaction";
import { fetchTransactionBytecode } from "../../utils/parseTransaction";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";

const DockerModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const apiKey = useAtomValue(etherscanApiKeyAtom);
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const setTransactionBytecode = useSetAtom(transactionBytecodeAtom);
  const { setActiveSection } = usePipelineAnimation();
  // API 키 입력 핸들러
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransactionHash(value);
  };

  const { isValid: isValidApiKey } = useDebouncedEtherscanValidation(apiKey);
  const { isValid: isValidTxHash } =
    useDebouncedTxHashValidation(transactionHash);

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
          className="absolute top-[99px] left-[88px] w-[200px] h-[21px] text-[16px] font-[600]"
          style={{
            background: "white",
          }}
        >
          <span>TOKAMAK-ZK-EVM</span>
        </div>
        <div
          className="absolute top-[94px] left-[358px] flex justify-center items-center h-[30px]"
          style={{
            background: "white",
          }}
        >
          <img className="cursor-pointer" src={DownloadButtonImage}></img>
        </div>
      </div>
    </div>
  );
};

export default DockerModal;

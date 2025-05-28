import React, { useEffect, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import TransactionInputModalImage from "../../assets/modals/transaction-input-modal.svg";
import InputButtonInactiveImage from "../../assets/modals/input-button-inactive.svg";
import InputButtonActiveImage from "../../assets/modals/input-button-active.svg";
import WarningIconImage from "../../assets/modals/warning-icon.svg";
import {
  etherscanApiKeyAtom,
  transactionBytecodeAtom,
  transactionHashAtom,
} from "../../atoms/api";
import { useDebouncedEtherscanValidation } from "../../hooks/useEtherscanApi";
import { useDebouncedTxHashValidation } from "../../hooks/useTransaction";
import { fetchTransactionBytecode } from "../../utils/parseTransaction";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";

const TransactionInputModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const apiKey = useAtomValue(etherscanApiKeyAtom);
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const setTransactionBytecode = useSetAtom(transactionBytecodeAtom);
  const { updateActiveSection } = usePipelineAnimation();
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

  const inputClose = async () => {
    if (!isActive) return;
    onClose();
    try {
      const { bytecode, from, to } =
        await fetchTransactionBytecode(transactionHash);
      setTransactionBytecode({ bytecode, from, to });
      updateActiveSection("transaction-to-synthesizer");
    } catch (error) {
      console.error("Transaction input modal input close error:", error);
      updateActiveSection("none");
    }
  };

  const isOpen = useMemo(
    () => activeModal === "transaction-input",
    [activeModal]
  );

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <div
          className="absolute w-[18px] h-[18px] top-[20px] left-[372px] cursor-pointer"
          onClick={onClose}
        ></div>
        <img
          src={TransactionInputModalImage}
          alt={"transaction-input-modal"}
        ></img>
        <div className="absolute top-[82px] left-[280px]">
          <img
            src={isActive ? InputButtonActiveImage : InputButtonInactiveImage}
            className={`${isActive ? "cursor-pointer" : ""}`}
            onClick={inputClose}
          />
        </div>
        <input
          className="absolute w-[238px] h-[40px] left-[30px] top-[82px] bg-transparent border-none outline-none px-[9px]"
          onChange={handleTransactionChange}
        ></input>
        {errorMessage && (
          <div className="absolute top-[126px] left-[30px] flex items-center">
            <img src={WarningIconImage} />
            <span className="text-[#DD140E] text-[14px] ml-[6px] pb-[2px]">
              {errorMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionInputModal;

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
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import { usePlaygroundStage } from "../../hooks/usePlaygroundStage";
import { useResetStage } from "../../hooks/useResetStage";

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
  const { allStagesAreDone } = usePlaygroundStage();
  const { initializeWithNewTransaction } = useResetStage();

  const onClose = () => {
    setActiveModal("none");
  };

  const inputClose = async () => {
    if (!isActive) return;

    // 먼저 상태를 초기화
    initializeWithNewTransaction();

    try {
      // 상태 초기화가 완료된 후 애니메이션 시작
      setTimeout(() => {
        updateActiveSection("transaction-to-synthesizer");
      }, 200); // 200ms 지연으로 상태 초기화 완료 대기

      onClose();
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
    return isValidApiKey && isValidTxHash && transactionHash.length > 0;
  }, [isValidApiKey, isValidTxHash, transactionHash]);

  const errorMessage = useMemo(() => {
    if (!isValidApiKey) return "Invalid API key. Update in settings.";
    if (!isValidTxHash && transactionHash.length > 0)
      return "Invalid transaction ID. Please verify.";
    return null;
  }, [isValidApiKey, isValidTxHash]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <div
          className="absolute w-[18px] h-[18px] top-[20px] right-[22px] cursor-pointer bg-red-500"
          onClick={onClose}
        ></div>
        <img
          src={TransactionInputModalImage}
          alt={"transaction-input-modal"}
          draggable={false}
          style={{ userSelect: "none", pointerEvents: "none" }}
        ></img>
        <div className="absolute top-[82px] right-[30px]">
          <img
            src={isActive ? InputButtonActiveImage : InputButtonInactiveImage}
            className={`${isActive ? "cursor-pointer" : ""}`}
            onClick={inputClose}
            draggable={false}
            style={{ userSelect: "none" }}
          />
        </div>
        <input
          className="absolute w-[578px] h-[40px] left-[30px] top-[82px] bg-transparent border-none outline-none px-[9px] z-[1] bg-white font-[14px] placeholder:text-[14px]"
          onChange={handleTransactionChange}
          value={transactionHash}
          placeholder="Enter transaction ID"
        ></input>
        {errorMessage && (
          <div className="absolute top-[126px] left-[30px] flex items-center">
            <img
              src={WarningIconImage}
              draggable={false}
              style={{ userSelect: "none" }}
            />
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

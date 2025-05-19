import React, { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import TransactionInputModalImage from "../../assets/modals/transaction-input-modal.svg";
import InputButtonInactiveImage from "../../assets/modals/input-button-inactive.svg";
import InputButtonActiveImage from "../../assets/modals/input-button-active.svg";
import WarningIconImage from "../../assets/modals/warning-icon.svg";
import { etherscanApiKeyAtom, transactionHashAtom } from "../../atoms/api";
import { validateEtherscanApiKey } from "../../utils/checkEtherscanApi";

const TransactionInputModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const apiKey = useAtomValue(etherscanApiKeyAtom);
  const setTransaction = useSetAtom(transactionHashAtom);
  const [isValidKey, setIsValidKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API 키 입력 핸들러
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTransaction(value);
  };

  const validateKey = async () => {
    setIsLoading(true);

    // try {
    const isValid = await validateEtherscanApiKey(apiKey);
    setIsValidKey(isValid);
  };

  const isOpen = useMemo(
    () => activeModal === "transaction-input",
    [activeModal]
  );

  const onClose = () => {
    setActiveModal("none");
  };

  if (!isOpen) return null;

  const isActive = useMemo(() => {
    return false;
  }, []);

  const errorMessage = useMemo(() => {
    if (!isValidKey) return "Invalid API key. Update in settings.";
    // if (errorMessage) return errorMessage;
    return null;
  }, [isValidKey]);

  useEffect(() => {
    validateKey();
  }, [apiKey]);

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

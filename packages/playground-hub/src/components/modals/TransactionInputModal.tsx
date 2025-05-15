import React, { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import TransactionInputModalImage from "../../assets/modals/transaction-input-modal.svg";
import InputButtonInactiveImage from "../../assets/modals/input-button-inactive.svg";
import InputButtonActiveImage from "../../assets/modals/input-button-active.svg";
import WarningIconImage from "../../assets/modals/warning-icon.svg";
import { etherscanApiKeyAtom, transactionHashAtom } from "../../atoms/api";

// 비동기 함수로 Etherscan API 키 검증
const validateEtherscanApiKey = async (apiKey: string): Promise<boolean> => {
  // API 키가 비어있거나 형식이 맞지 않으면 즉시 실패 처리
  if (!apiKey || apiKey.trim().length < 30) {
    return false;
  }

  try {
    // Etherscan의 가장 간단한 API 요청으로 테스트 (이더리움 최신 블록 번호 조회)
    const response = await fetch(
      `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`
    );

    const data = await response.json();

    // API 응답 검사: 결과가 성공이면 유효한 키
    if (data.status === "1" || data.message === "OK" || data.result) {
      return true;
    }

    // API 한도 초과 응답도 유효한 키로 간주 (키는 맞지만 사용량 초과)
    if (data.message && data.message.includes("rate limit")) {
      return true;
    }

    // API 키 오류 메시지가 있으면 유효하지 않은 키
    if (
      data.message &&
      data.message.toLowerCase().includes("invalid api key")
    ) {
      return false;
    }

    return false;
  } catch (error) {
    console.error("Error validating Etherscan API key:", error);
    return false;
  }
};

const TransactionInputModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const apiKey = useAtomValue(etherscanApiKeyAtom);
  const [, setTransaction] = useAtom(transactionHashAtom);
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

    //   if (!isValid) {
    //     setErrorMessage("Invalid API key. Update in settings.");
    //   }
    // } catch (error) {
    //   setIsValidKey(false);
    //   setErrorMessage("Error validating API key. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
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

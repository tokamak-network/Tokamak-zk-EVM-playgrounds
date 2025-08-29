import { useAtom } from "jotai";
import { transactionHashAtom } from "../atoms/api";
import { useDebouncedTxHashValidation } from "../hooks/useTransaction";
import { isErrorAtom, isFirstTimeAtom } from "../atoms/ui";
import { useTokamakZkEVMActions } from "../hooks/useTokamakZkEVMActions";
import { useMemo, useState } from "react";
import { useUI } from "../hooks/useUI";

export default function TransactionInput() {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const { isValid: isValidTxHash } =
    useDebouncedTxHashValidation(transactionHash);
  const { executeAll } = useTokamakZkEVMActions();
  const { isHeroUp, isInProcess } = useUI();
  const [isFocused, setIsFocused] = useState(false);
  const [isError, setIsError] = useAtom(isErrorAtom);
  const [isFirstTime, setIsFirstTime] = useAtom(isFirstTimeAtom);

  const errorCase = useMemo(() => {
    return isError && isValidTxHash;
  }, [isError, isValidTxHash]);

  const isActive = useMemo(() => {
    return isValidTxHash && !errorCase && isFocused && !isInProcess;
  }, [isValidTxHash, errorCase, isFocused, isInProcess]);

  // Button styles based on state - following Figma design exactly
  const getButtonStyles = () => {
    if (isActive) {
      // Active state - blue background with light text
      return {
        backgroundColor: "#008BEE",
        color: "#F8F8F8",
        cursor: "pointer",
        borderTop: "1px solid #A8A8A8",
        borderLeft: "1px solid #A8A8A8",
        borderBottom: "1px solid #5F5F5F",
        borderRight: "1px solid #5F5F5F",
      };
    } else if (errorCase) {
      // Error state - red background with gray text
      return {
        backgroundColor: "#FF4444",
        color: "#E0E0E0",
        cursor: "not-allowed",
        borderTop: "1px solid #A8A8A8",
        borderLeft: "1px solid #A8A8A8",
        borderBottom: "1px solid #5F5F5F",
        borderRight: "1px solid #5F5F5F",
      };
    } else {
      // Disabled state - dark gray background with gray text
      return {
        backgroundColor: "#7C7C88",
        color: "#E0E0E0",
        cursor: "not-allowed",
        borderTop: "1px solid #A8A8A8",
        borderLeft: "1px solid #A8A8A8",
        borderBottom: "1px solid #5F5F5F",
        borderRight: "1px solid #5F5F5F",
      };
    }
  };

  return (
    <div
      className={`flex gap-[16px] w-full ${
        isHeroUp ? "h-[40px]" : "h-[56px]"
      } z-[100]`}
    >
      <input
        className={`focus:outline-none focus:ring-0 focus:border-transparent transaction-input`}
        style={{
          width: "100%",
          height: "100%",
          borderTop: "1px solid #A8A8A8",
          borderLeft: "1px solid #A8A8A8",
          borderBottom: "1px solid #5F5F5F",
          borderRight: "1px solid #5F5F5F",
          padding: "8px",
          color: errorCase
            ? "#DF3737"
            : isFirstTime
              ? "#222"
              : (isHeroUp && isInProcess) || (isHeroUp && isFocused)
                ? "#fff"
                : "#999",
          fontFamily: "IBM Plex Mono",
          fontSize: !isHeroUp ? "20px" : "16px",
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "normal",
          backgroundColor: isHeroUp ? "transparent" : "#fff",
        }}
        placeholder={isFocused ? "" : "Enter an Ethereum transaction hash"}
        value={transactionHash}
        onChange={(e) => setTransactionHash(e.target.value)}
        onFocus={() => {
          if (isError) {
            setIsError(false);
            setTransactionHash("");
            // setIsFirstTime(true);
          }
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
      ></input>
      <button
        className="transition-all duration-150 ease-in-out active:scale-95"
        style={{
          width: "182px",
          height: "100%",
          fontFamily: "IBM Plex Mono",
          fontSize: isHeroUp ? "16px" : "20px",
          fontStyle: "normal",
          fontWeight: "600",
          lineHeight: "normal",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          ...getButtonStyles(),
        }}
        onMouseEnter={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor = "#106AAB"; // Active hover - darker blue
            e.currentTarget.style.color = "#F8F8F8"; // Keep light text color
          } else if (errorCase) {
            e.currentTarget.style.backgroundColor = "#DD3333"; // Error hover - darker red
            e.currentTarget.style.color = "#E0E0E0"; // Keep gray text color
          }
        }}
        onMouseLeave={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor = "#008BEE"; // Back to original blue
            e.currentTarget.style.color = "#F8F8F8"; // Keep light text color
          } else if (errorCase) {
            e.currentTarget.style.backgroundColor = "#FF4444"; // Back to original red
            e.currentTarget.style.color = "#E0E0E0"; // Keep gray text color
          }
        }}
        onClick={() => {
          // Check if button should be active (ignore isFocused for click)
          const canExecute = isValidTxHash && !errorCase && !isInProcess;
          if (canExecute) {
            executeAll();
          }
        }}
        disabled={!isValidTxHash || isInProcess}
      >
        {/* Process Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isHeroUp ? "16" : "20"}
          height={isHeroUp ? "16" : "20"}
          viewBox="0 0 24 24"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M18 20H20V6H22V22H2V2H18V4H4V20H6V14H18V20ZM8 20H16V16H8V20ZM15 10H6V6H15V10ZM20 6H18V4H20V6"
            fill={isActive ? "#F8F8F8" : "#E0E0E0"}
          />
        </svg>
        <span>{"Process"}</span>
      </button>
    </div>
  );
}

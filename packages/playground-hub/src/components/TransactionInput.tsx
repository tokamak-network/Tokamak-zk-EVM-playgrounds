import { useAtom, useAtomValue } from "jotai";
import { transactionHashAtom } from "../atoms/api";
import ProcessBtnImageDisabled from "@/assets/process-button-inactive.svg";
import ProcessBtnImageActive from "@/assets/process-button-active.svg";
import ProcessBtnImageError from "@/assets/process-button-error.svg";
import { useDebouncedTxHashValidation } from "../hooks/useTransaction";
import { isErrorAtom } from "../atoms/ui";
import { useTokamakZkEVMActions } from "../hooks/useTokamakZkEVMActions";
import { useMemo } from "react";
import { useUI } from "../hooks/useUI";

export default function TransactionInput() {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const { isValid: isValidTxHash } =
    useDebouncedTxHashValidation(transactionHash);
  const isError = useAtomValue(isErrorAtom);
  const { executeAll } = useTokamakZkEVMActions();
  const { isFirstTime, isInProcess, showProcessResultModal } = useUI();

  const processBtnImage = isValidTxHash
    ? ProcessBtnImageActive
    : isError
      ? ProcessBtnImageError
      : ProcessBtnImageDisabled;

  const isActive = useMemo(() => {
    return isValidTxHash && !isError;
  }, [isValidTxHash, isError]);

  return (
    <div className="flex gap-[16px] w-full h-[59px] z-[100]">
      <input
        className={`${isFirstTime ? "min-w-[838px]" : "min-w-[656px]"}`}
        style={{
          width: "100%",
          height: "100%",
          borderTop: "1px solid #A8A8A8",
          borderLeft: "1px solid #A8A8A8",
          borderBottom: "1px solid #5F5F5F",
          borderRight: "1px solid #5F5F5F",
          padding: "8px",
          color: isFirstTime ? "#222" : "#999",
          fontFamily: "IBM Plex Mono",
          fontSize: isFirstTime ? "20px" : "16px",
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "normal",
          backgroundColor:
            isInProcess || showProcessResultModal ? "transparent" : "#fff",
        }}
        value={transactionHash}
        onChange={(e) => setTransactionHash(e.target.value)}
      ></input>
      <img
        className="cursor-pointer"
        src={processBtnImage}
        alt="ProcessBtnImage"
        onClick={() => isActive && executeAll()}
      />
    </div>
  );
}

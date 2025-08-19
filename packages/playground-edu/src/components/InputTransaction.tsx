import { useAtom } from "jotai";
import { transactionHashAtom } from "../atoms/api";
import ProcessBtnImage from "../assets/process-button.svg";
import { useTokamakZkEVMActions } from "../hooks/useTokamakZkEVMActions";

export default function InputTransaction() {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const { executeAll } = useTokamakZkEVMActions();

  return (
    <div className="flex gap-[16px] w-full h-[59px] z-[100]">
      <input
        className="min-w-[838px]"
        style={{
          width: "100%",
          height: "100%",
          borderTop: "1px solid #A8A8A8",
          borderLeft: "1px solid #A8A8A8",
          borderBottom: "1px solid #5F5F5F",
          borderRight: "1px solid #5F5F5F",
          padding: "8px",
          color: "#222",
          fontFamily: "IBM Plex Mono",
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "normal",
        }}
        value={transactionHash}
        onChange={(e) => setTransactionHash(e.target.value)}
      ></input>
      <img
        src={ProcessBtnImage}
        alt="ProcessBtnImage"
        onClick={() => executeAll()}
      />
    </div>
  );
}

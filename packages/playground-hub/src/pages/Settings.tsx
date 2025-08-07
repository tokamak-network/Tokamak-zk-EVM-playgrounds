import { useMemo } from "react";
import { useSystemTheme } from "../hooks/useSystemTheme";
import { etherscanApiKeyAtom } from "../atoms/api";
import { useAtom } from "jotai";
import { useDebouncedEtherscanValidation } from "../hooks/useEtherscanApi";
import WarningIconImage from "../assets/modals/warning-icon.svg";

export default function Settings() {
  const isDarkMode = useSystemTheme();
  console.log("isDarkMode", isDarkMode);
  const [etherscanApiKey, setEtherscanApiKey] = useAtom(etherscanApiKeyAtom);

  // 다크모드에 따라 배경색 클래스 적용
  const bgColor = isDarkMode ? "#282828" : "#F6F6F6";

  const { isValid } = useDebouncedEtherscanValidation(etherscanApiKey);

  const isKeyValid = useMemo(() => {
    if (etherscanApiKey.length === 0 || isValid === null) return undefined;
    return isValid;
  }, [isValid, etherscanApiKey]);

  const isActive = useMemo(() => {
    if (isKeyValid === undefined) return false;
    return isKeyValid;
  }, [isKeyValid]);

  const handleSave = () => {
    if (isActive) {
      return window.electron.closeSettingsWindow();
    }
  };

  const showWarning = !isKeyValid && isKeyValid !== undefined;

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center py-[24px] `}
      style={{
        backgroundColor: bgColor,
        color: isDarkMode ? "#282828" : "#111111",
        boxShadow:
          "0px 0px 20px 0px rgba(0, 0, 0, 0.15), 0px 25px 30px 0px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div className="flex flex-col items-center justify-center w-[430px] px-[20px]">
        <div className="flex items-center justify-center font-[500] mb-[17px]">
          <h3
            style={{
              fontSize: "14px",
              color: isDarkMode ? "#ffffff" : "#111111",
            }}
          >
            Enter your API key to authenticate and continue.
          </h3>
        </div>
        <input
          className={`w-full max-w-[390px] h-[40px] ${
            showWarning ? "mb-[10px]" : "mb-[24px]"
          } focus:outline-none focus:ring-0 focus:border-none text-[16px] px-[12px]`}
          style={{
            borderTop: isDarkMode ? "1px solid #1B1B1B" : "1px solid #5F5F5F",
            borderLeft: isDarkMode ? "1px solid #1B1B1B" : "1px solid #5F5F5F",
            borderRight: isDarkMode ? "1px solid #535353" : "1px solid #DFDFDF",
            borderBottom: isDarkMode
              ? "1px solid #535353"
              : "1px solid #DFDFDF",
          }}
          value={etherscanApiKey}
          type="text"
          placeholder="API key"
          onChange={(e) => {
            if (typeof e.target.value === "string") {
              setEtherscanApiKey(e.target.value);
            }
          }}
        />
        {showWarning && (
          <div className="flex w-full gap-[6px] mb-[16px]">
            <img src={WarningIconImage}></img>
            <p className="text-[14px] text-[#DD140E]">
              This API key is invalid.
            </p>
          </div>
        )}
        <button
          className="w-[140px] h-[36px] cursor-pointer"
          style={{
            backgroundColor: isActive ? "#F43DE3" : "#5E5E5E",
            borderTop: "1px solid #A8A8A8",
            borderLeft: "1px solid #A8A8A8",
            borderRight: "1px solid #4B4B4B",
            borderBottom: "1px solid #4B4B4B",
          }}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}

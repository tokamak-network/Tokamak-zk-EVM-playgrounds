import { useMemo } from "react";
import { useSystemTheme } from "../hooks/useSystemTheme";

export default function Settings() {
  const isDarkMode = useSystemTheme();
  console.log("isDarkMode", isDarkMode);

  // 다크모드에 따라 배경색 클래스 적용
  const bgColor = isDarkMode ? "black" : "white";

  const isActive = useMemo(() => {
    return false;
  }, []);

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center py-[24px] px-[20px]`}
      style={{
        backgroundColor: bgColor,
        color: isDarkMode ? "white" : "#282828",
        boxShadow:
          "0px 0px 20px 0px rgba(0, 0, 0, 0.15), 0px 25px 30px 0px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div className="flex items-center justify-center font-[500] mb-[17px]">
        <h3
          style={{
            fontSize: "14px",
          }}
        >
          Enter your API key to authenticate and continue.
        </h3>
      </div>
      <input
        className="w-full max-w-[390px] h-[40px] mb-[24px] cursor-pointer"
        type="text"
        placeholder="API key"
      />
      <button
        className="w-[140px] h-[36px]"
        style={{
          backgroundColor: isActive ? "#F43DE3" : "#5E5E5E",
          borderTop: "1px solid #A8A8A8",
          borderLeft: "1px solid #A8A8A8",
          borderRight: "1px solid #4B4B4B",
          borderBottom: "1px solid #4B4B4B",
        }}
      >
        Save
      </button>
    </div>
  );
}

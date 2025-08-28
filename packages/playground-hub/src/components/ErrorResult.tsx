import { useEffect, useState } from "react";
import ErrorSpinnerImage from "@/assets/components/error-spinner.svg";
import { useAtomValue } from "jotai";
import { isErrorAtom } from "../atoms/ui";
import { appInit } from "../utils/helpers";

interface ErrorDisplayProps {
  spinner: React.ReactNode;
}

const ErrorDisplay = ({ spinner }: ErrorDisplayProps) => {
  return (
    <div className="flex relative">
      <img src={ErrorSpinnerImage} alt="Error Spinner" />
      <div className="absolute w-full h-full top-[40px] left-[8px]">
        {spinner}
      </div>
      <div
        className="absolute w-[373px] h-[31px] bottom-[16px] left-[10px] cursor-pointer"
        onClick={() => {
          appInit();
        }}
      ></div>
    </div>
  );
};

export default function ErrorResult() {
  const [activeBoxes, setActiveBoxes] = useState(20); // Fixed at error state
  const totalBoxes = 24;
  const isError = useAtomValue(isErrorAtom);

  useEffect(() => {
    // Set to error state (20 boxes active)
    setActiveBoxes(20);
  }, []);

  const ErrorSpinner = () => {
    return (
      <div
        className="w-[382px] h-[31px] flex items-center px-[8px] py-[3px] gap-[4px]"
        style={{
          backgroundColor: "#fff",
          borderTop: "1px solid #5F5F5F",
          borderLeft: "1px solid #5F5F5F",
          borderBottom: "1px solid #DFDFDF",
          borderRight: "1px solid #DFDFDF",
        }}
      >
        {Array.from({ length: totalBoxes }).map((_, idx) => (
          <div key={idx} className="flex-1 h-full">
            <div
              className={`w-full h-full ${idx < activeBoxes ? "bg-[#BC2828]" : "bg-[#a5a5a5]"}`}
            />
          </div>
        ))}
      </div>
    );
  };

  // Only render when there's an error
  if (!isError) return null;

  return (
    <div className="flex">
      <ErrorDisplay spinner={<ErrorSpinner />} />
    </div>
  );
}

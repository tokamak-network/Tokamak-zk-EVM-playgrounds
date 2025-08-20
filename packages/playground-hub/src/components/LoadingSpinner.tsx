import { useEffect, useState } from "react";
import LoadingSpinnerImage from "@/assets/components/loading-spinner.svg";
import ErrorSpinnerImage from "@/assets/components/error-spinner.svg";
import { useAtomValue } from "jotai";
import { isErrorAtom } from "../atoms/ui";
import { appInit } from "../utils/helpers";
import { usePlaygroundStage } from "../hooks/usePlaygroundStage";

interface LoadingProps {
  spinner: React.ReactNode;
}

const Loading = ({ spinner }: LoadingProps) => {
  const isError = useAtomValue(isErrorAtom);
  const spinnerImage = isError ? ErrorSpinnerImage : LoadingSpinnerImage;

  return (
    <div className="flex relative">
      <img src={spinnerImage} alt="LoadingSpinnerImage" />
      <div className="absolute w-full h-full top-[40px] left-[8px]">
        {spinner}
      </div>
      {isError && (
        <div
          className="absolute w-[373px] h-[31px] bottom-[16px] left-[10px] cursor-pointer"
          onClick={() => {
            appInit();
          }}
        ></div>
      )}
    </div>
  );
};

export default function LoadingSpinner() {
  const [activeBoxes, setActiveBoxes] = useState(0);
  const totalBoxes = 24;
  const isError = useAtomValue(isErrorAtom);
  const { playgroundStageInProcess } = usePlaygroundStage();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBoxes((prev) => (prev < totalBoxes ? prev + 1 : 0));
    }, 75);
    return () => clearInterval(interval);
  }, []);

  const Spinner = () => {
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
              className={`w-full h-full ${idx < activeBoxes ? (isError ? "bg-[#BC2828]" : "bg-[#2a72e5]") : "bg-[#a5a5a5]"}`}
            />
          </div>
        ))}
      </div>
    );
  };

  if (!playgroundStageInProcess) return null;

  return (
    <div className="flex">
      <Loading spinner={<Spinner />} />
    </div>
  );
}

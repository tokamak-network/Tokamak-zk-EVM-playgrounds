import { ReactNode } from "react";
import { useContentView } from "../hooks/useContentView";

interface ScrollBarProps {
  children: ReactNode;
}

const ScrollBar = ({ children }: ScrollBarProps) => {
  const { maxHeight } = useContentView();

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 16px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #DFDFDF;
          border: 1px solid #919B9C;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #BDBDBD;
          border: 1px solid #919B9C;
        }

        .custom-scrollbar::-webkit-scrollbar-button:vertical:decrement {
          background-image: url("/assets/Top.svg");
          background-repeat: no-repeat;
          background-position: center;
          height: 16px;
          width: 16px;
          border: 1px solid #a8a8a8;
        }

        .custom-scrollbar::-webkit-scrollbar-button:vertical:increment {
          background-image: url("/assets/Bottom.svg");
          background-repeat: no-repeat;
          background-position: center;
          height: 16px;
          width: 16px;
          border: 1px solid #a8a8a8;
        }
      `}</style>
      <div
        className={`relative w-[729px] bg-[#bdbdbd] h-[calc(100%-40px)] border-[9px] border-[#bdbdbd] overflow-y-auto left-0 top-0 custom-scrollbar`}
        style={{ height: "500px" }}
      >
        {children}
      </div>
    </>
  );
};

export default ScrollBar;

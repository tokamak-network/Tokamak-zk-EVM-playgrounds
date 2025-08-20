import React from "react";
import Bani from "@/assets/bani.svg";
import Rainbow from "@/assets/rainbow.svg";

interface RainbowImageProps {
  isOverBreakpoint?: boolean;
  animationKey?: number;
}

const RainbowImage: React.FC<RainbowImageProps> = ({
  isOverBreakpoint = true,
  animationKey = 0,
}) => {
  return (
    <div
      className={`flex w-full ${isOverBreakpoint ? "h-[75px]" : "h-[63px]"} relative overflow-hidden `}
    >
      <div
        className={`absolute w-full h-[50px] z-[1000] bottom-[11px] overflow-hidden`}
        style={{
          animation: "moveRainbow 6s linear",
        }}
        key={animationKey}
      >
        <div className="flex" style={{ width: "2880px" }}>
          <img
            src={Rainbow}
            alt="Rainbow"
            className="flex-shrink-0"
            style={{
              width: "1440px",
              height: "50px",
              objectFit: "none",
              objectPosition: "center center",
            }}
          />
          <img
            src={Rainbow}
            alt="Rainbow"
            className="flex-shrink-0"
            style={{
              width: "1440px",
              height: "50px",
              objectFit: "none",
              objectPosition: "center center",
            }}
          />
        </div>
      </div>
      <div
        className={`absolute w-full ${isOverBreakpoint ? "h-[75px]" : "h-[63px]"} z-[9999999] opacity-0`}
        style={{
          animation: "moveBani 6s linear",
        }}
        key={animationKey + 1}
      >
        <img
          src={Bani}
          alt="Rainbow"
          width={isOverBreakpoint ? 113 : 92}
          height={isOverBreakpoint ? 73 : 60}
          className={`absolute bottom-[6px] ${isOverBreakpoint ? "right-[-95px]" : "right-[-78px]"}`}
        />
      </div>
      <style>{`
        @keyframes moveRainbow {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);  
          }
        }
        @keyframes moveBani {
          0% {
            transform: translateX(-100%);
            opacity: 1
          }
          99% {
            opacity: 1
          }
          100% {
            transform: translateX(0%);
            opacity: 0;  
          }
        }
      `}</style>
    </div>
  );
};

export default RainbowImage;

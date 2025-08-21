import React, { useEffect, useRef, useState } from "react";
import Bani from "@/assets/bani.svg";
import Rainbow from "@/assets/rainbow.svg";
import { useUI } from "../hooks/useUI";

interface RainbowImageProps {
  isOverBreakpoint?: boolean;
}

const RainbowImage: React.FC<RainbowImageProps> = ({
  isOverBreakpoint = true,
}) => {
  const { isHeroUp } = useUI();
  const prevIsHeroUpRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [internalAnimationKey, setInternalAnimationKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial mount animation
  useEffect(() => {
    // Play animation on initial mount regardless of isHeroUp value
    setShouldAnimate(true);
    setInternalAnimationKey((prev) => prev + 1);
    setIsInitialized(true);

    // Reset animation state after animation completes (6s)
    setTimeout(() => {
      setShouldAnimate(false);
    }, 6000);
  }, []); // Empty dependency array - runs only on mount

  useEffect(() => {
    // Skip if not initialized yet (initial mount is handled above)
    if (!isInitialized) return;

    // Check if isHeroUp changed from false to true
    if (!prevIsHeroUpRef.current && isHeroUp) {
      setShouldAnimate(true);
      setInternalAnimationKey((prev) => prev + 1);

      // Reset animation state after animation completes (6s)
      setTimeout(() => {
        setShouldAnimate(false);
      }, 6000);
    }

    // Update previous value
    prevIsHeroUpRef.current = isHeroUp;
  }, [isHeroUp, isInitialized]);
  return (
    <div
      className={`flex w-full ${isOverBreakpoint ? "h-[75px]" : "h-[63px]"} relative overflow-hidden `}
    >
      <div
        className={`absolute w-full h-[50px] z-[1000] bottom-[11px] overflow-hidden`}
        style={{
          animation: shouldAnimate ? "moveRainbow 6s linear" : "none",
        }}
        key={internalAnimationKey}
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
          animation: shouldAnimate ? "moveBani 6s linear" : "none",
        }}
        key={internalAnimationKey + 1}
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

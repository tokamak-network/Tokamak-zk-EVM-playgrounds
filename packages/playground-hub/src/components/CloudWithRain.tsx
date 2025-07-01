import { useEffect, useRef } from "react";
import cloudSkyblue from "../assets/images/cloud-skyblue.svg";
import cloudBlue from "../assets/images/cloud-blue.svg";
import blueRain from "../assets/images/rain-blue.svg";
import skyblueRain from "../assets/images/rain-skyblue.svg";
import "../style.css";
import { useModals } from "../hooks/useModals";
import { usePlaygroundStartStage } from "../hooks/usePlaygroundStage";

interface CloudWithRainProps {
  position: string;
  cloudType?: "blue" | "skyblue";
  rainOffset?: string;
}

export default function CloudWithRain({
  position,
  cloudType = "skyblue",
  rainOffset = "top-[35px] ml-[10px]",
}: CloudWithRainProps) {
  const isEVMSpec = cloudType === "blue";
  const cloudImage = isEVMSpec ? cloudBlue : cloudSkyblue;
  const rainRef = useRef<HTMLDivElement>(null);

  const { openModal } = useModals();

  const { playgroundStartStage } = usePlaygroundStartStage();
  const showRain = isEVMSpec
    ? playgroundStartStage.evmSpec
    : playgroundStartStage.transactionHash;

  // SVG 내부의 빗방울들에 개별 애니메이션 적용
  useEffect(() => {
    if (rainRef.current && showRain) {
      // SVG 내부의 모든 빗방울 그룹 선택
      const svgDoc = rainRef.current.querySelector("svg");
      if (svgDoc) {
        const raindrops = svgDoc.querySelectorAll(".raindrop");

        // 각 빗방울에 랜덤한 애니메이션 속성 적용
        raindrops.forEach((drop) => {
          // 랜덤한 지연 시간 (0~1초)
          const delay = Math.random() * 1;
          // 랜덤한 지속 시간 (1.5~3초)
          const duration = 1.5 + Math.random() * 1.5;

          // 애니메이션 스타일 적용
          drop.setAttribute(
            "style",
            `
            animation: rainDrop ${duration}s linear ${delay}s infinite;
            transform-origin: center;
          `
          );
        });
      }
    }
  }, [showRain]);

  return (
    <div className={`absolute ${position} z-[100]`}>
      <img
        src={cloudImage}
        alt={`cloud-${cloudType}`}
        className="max-w-full max-h-full object-contain z-[100] cursor-pointer"
        draggable={false}
        style={{ userSelect: "none" }}
        onClick={() => {
          if (isEVMSpec) {
            return openModal("docker-select");
          }
          return openModal("transaction-input");
        }}
      />
      {showRain && (
        <div ref={rainRef} className={`absolute ${rainOffset} z-[50]`}>
          <object
            data={isEVMSpec ? blueRain : skyblueRain}
            type="image/svg+xml"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import LoadingModalImage from "../../assets/modals/loading/loading-modal.svg";
import skyblueRain from "../../assets/images/rain-skyblue.svg";
import "../../style.css";

const LoadingModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(() => activeModal === "loading", [activeModal]);

  const onClose = () => {
    setActiveModal("none");
  };

  const rainRef = useRef<HTMLDivElement>(null);

  // SVG 내부의 빗방울들에 개별 애니메이션 적용
  useEffect(() => {
    if (rainRef.current) {
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
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <img src={LoadingModalImage} alt={"loading-modal"}></img>
        <div
          ref={rainRef}
          className={`absolute $ z-[50] top-[120px] left-[110px] w-[72px] h-[72px]`}
          style={{
            background: "white",
          }}
        >
          <object
            data={skyblueRain}
            type="image/svg+xml"
            className="w-full h-full"
          />
        </div>
        <div
          className="absolute w-[18px] h-[18px] top-[20px] left-[260px] cursor-pointer"
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
};

export default LoadingModal;

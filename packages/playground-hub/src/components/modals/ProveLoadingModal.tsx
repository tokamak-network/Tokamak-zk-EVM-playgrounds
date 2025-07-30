import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import LoadingModalImage from "../../assets/modals/loading/loading-modal.svg";
import skyblueRain from "../../assets/images/rain-skyblue.svg";
import "../../style.css";
import proveProcess1 from "../../assets/modals/prove/prove-process-1.png";
import proveProcess2 from "../../assets/modals/prove/prove-process-2.png";
import proveProcess3 from "../../assets/modals/prove/prove-process-3.png";
import proveProcess4 from "../../assets/modals/prove/prove-process-4.png";
import proveProcess5 from "../../assets/modals/prove/prove-process-5.png";
import proveProcess6 from "../../assets/modals/prove/prove-process-6.png";

const ProveLoadingModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(() => activeModal === "loading", [activeModal]);

  // Prove 단계 상태 관리 (1~6)
  const [proveStep, setProveStep] = useState(1);

  // 각 단계별 이미지와 텍스트 배열
  const proveImages = [
    proveProcess1,
    proveProcess2,
    proveProcess3,
    proveProcess4,
    proveProcess5,
    proveProcess6,
  ];

  const proveTexts = [
    "Cloud is waking up…",
    "Oops, a drop!",
    "Rain's starting…",
    "Pouring now!",
    "Catch it if you can!",
    "Still raining!",
  ];

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

  //   if (!isOpen) return null;

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
          className="absolute w-[250px] h-[62px] top-[192px] left-[24px] flex flex-col justify-center items-center gap-[8px]"
          style={{
            background: "white",
          }}
        >
          <span
            style={{
              color: "#111",
              textAlign: "center",
              fontFamily: "IBM Plex Mono",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "26px",
              letterSpacing: "-0.36px",
            }}
          >
            {proveTexts[proveStep - 1]}
          </span>
          <img
            src={proveImages[proveStep - 1]}
            alt={`proveProcess${proveStep}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProveLoadingModal;

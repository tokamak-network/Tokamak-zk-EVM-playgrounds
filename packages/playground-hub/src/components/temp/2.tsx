import React, { useState, useEffect, useRef } from "react";
import pipeline from "../assets/images/pipe.png";
import pipelineFilled from "../assets/images/pipe-filled.png";

interface PipelinesProps {
  fillPercentage?: number; // 0-100 사이의 값으로 채워진 파이프라인의 표시 비율
  animationDuration?: number; // 애니메이션 지속 시간(ms)
  autoFill?: boolean; // 자동으로 채우기 여부
}

export default function Pipelines({
  fillPercentage = 0,
  animationDuration = 3000,
  autoFill = false,
}: PipelinesProps) {
  const [currentFill, setCurrentFill] = useState(fillPercentage);
  const filledImgRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 자동 채우기 애니메이션
  useEffect(() => {
    if (autoFill) {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        setCurrentFill(progress * 100);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // autoFill이 아닌 경우 props로 전달된 fillPercentage 사용
      setCurrentFill(fillPercentage);
    }
  }, [autoFill, animationDuration, fillPercentage]);

  // 이미지가 로드된 후 클립 패스 적용
  useEffect(() => {
    const updateClipPath = () => {
      if (filledImgRef.current) {
        // 왼쪽에서 오른쪽으로 채우기
        const clipValue = `inset(0 ${100 - currentFill}% 0 0)`;
        filledImgRef.current.style.clipPath = clipValue;
      }
    };

    updateClipPath();
  }, [currentFill]);

  return (
    <div className="absolute w-full h-full">
      <img
        src={pipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[155px]"
      />
      <img
        ref={filledImgRef}
        src={pipelineFilled}
        alt="pipeline-filled"
        className="absolute max-w-full max-h-full object-contain mt-[155px]"
        style={{
          clipPath: `inset(0 ${100 - currentFill}% 0 0)`,
          transition: "clip-path 0.3s ease-out",
        }}
      />
    </div>
  );
}

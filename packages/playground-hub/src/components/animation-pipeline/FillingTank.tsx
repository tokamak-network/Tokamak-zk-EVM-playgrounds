import { useState, useEffect, useRef } from "react";
import tankTrue from "../../assets/images/tank-true.png";
import tankFalse from "../../assets/images/tank-false.png";
import usePlaygroundStage from "../../hooks/usePlaygroundStage";

interface FillingTankProps {
  animationDuration?: number; // ms
  autoFill?: boolean;
  onFillComplete?: () => void;
  delay?: number; // ms
}

export default function FillingTank({
  animationDuration = 1000,
  autoFill = true,
  onFillComplete,
  delay = 0,
}: FillingTankProps) {
  const [currentFill, setCurrentFill] = useState(0); // 0~100
  const [imgLoaded, setImgLoaded] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isReadyForResult: active } = usePlaygroundStage();
  // 애니메이션
  useEffect(() => {
    // active가 true이고 autoFill이 true이며 이미지가 로드되었을 때만 애니메이션 실행
    if (active && autoFill && imgLoaded) {
      delayTimeoutRef.current = setTimeout(() => {
        const animate = (timestamp: number) => {
          if (startTimeRef.current === null) {
            startTimeRef.current = timestamp;
          }
          const elapsed = timestamp - startTimeRef.current;
          const progress = Math.min(elapsed / animationDuration, 1);

          setCurrentFill(progress * 100);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            if (onFillComplete) onFillComplete();
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      }, delay);

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
        startTimeRef.current = null;
      };
    }
  }, [active, autoFill, animationDuration, delay, onFillComplete, imgLoaded]);

  // active가 false로 변경될 때 애니메이션 리셋
  useEffect(() => {
    if (!active) {
      setCurrentFill(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
      startTimeRef.current = null;
    }
  }, [active]);

  // clip-path 값 계산
  const clipValue = `inset(${100 - currentFill}% 0% 0% 0%)`;

  return (
    <div
      className="absolute max-w-full max-h-full object-contain top-[697px] right-[109px] flex items-end justify-end overflow-hidden"
      style={{ background: "transparent" }}
    >
      <img
        src={tankTrue}
        alt="tank-filled"
        className="w-full h-full object-contain"
        style={{
          clipPath: clipValue,
          WebkitClipPath: clipValue,
          transition: `clip-path ${animationDuration}ms linear, -webkit-clip-path ${animationDuration}ms linear`,
        }}
        onLoad={() => setImgLoaded(true)}
        draggable={false}
      />
    </div>
  );
}

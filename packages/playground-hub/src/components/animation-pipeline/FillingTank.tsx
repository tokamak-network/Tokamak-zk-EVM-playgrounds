import { useState, useEffect, useRef, useMemo } from "react";
import tankTrue from "../../assets/images/tank-true.png";
import tankFalse from "../../assets/images/tank-false.png";
import { useTokamakZkEVMActions } from "../../hooks/useTokamakZkEVMActions";
import { useModals } from "../../hooks/useModals";

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
  delay = 1000, // 500ms 딜레이 후 애니메이션 시작
}: FillingTankProps) {
  const [currentFill, setCurrentFill] = useState(0); // 0~100
  const [imgLoaded, setImgLoaded] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const modalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { provingIsDone, provingResult } = useTokamakZkEVMActions();
  const { openModal } = useModals();

  const active = useMemo(() => {
    return provingIsDone;
  }, [provingIsDone]);

  // 애니메이션 시작 조건 체크 및 모달 타이머 설정
  useEffect(() => {
    if (active && autoFill && imgLoaded && !animationStarted) {
      console.log("🎬 Starting tank filling animation...");
      setAnimationStarted(true);

      // 🎯 간단한 접근법: 애니메이션 지속 시간 계산 후 모달 열기 타이머 설정
      const totalAnimationTime = delay + animationDuration + 1200; // 여유분 1200ms

      console.log(
        `⏰ Setting modal timer for ${totalAnimationTime}ms (delay: ${delay}ms + duration: ${animationDuration}ms + buffer: 1200ms)`
      );

      // proving 결과가 true일 때만 모달 열기 타이머 설정
      if (provingResult === true && !modalOpened) {
        modalTimerRef.current = setTimeout(() => {
          console.log("✅ Opening submit modal after animation duration!");
          setModalOpened(true);
          openModal("submit");
        }, totalAnimationTime);
      }
    }
  }, [
    active,
    autoFill,
    imgLoaded,
    animationStarted,
    provingResult,
    modalOpened,
    delay,
    animationDuration,
    openModal,
  ]);

  // 애니메이션 실행 (기존 로직 유지)
  useEffect(() => {
    if (!animationStarted) return;

    console.log("🚀 Executing animation with duration:", animationDuration);

    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        setCurrentFill(progress * 100);

        // 애니메이션 진행 상황 로그
        if (Math.floor(progress * 10) % 2 === 0 && progress < 1) {
          console.log(
            `🌊 Tank filling progress: ${Math.round(progress * 100)}%`
          );
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // 애니메이션 완료
          console.log(
            "🎉 Tank filling animation 100% completed! Final progress:",
            progress
          );
          if (onFillComplete) onFillComplete();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    // cleanup
    return () => {
      console.log("🧹 Animation useEffect cleanup");
      if (timeoutId) clearTimeout(timeoutId);
      if (animationRef.current) {
        console.log("🛑 Canceling animation frame in cleanup");
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      startTimeRef.current = null;
    };
  }, [animationStarted, animationDuration, delay, onFillComplete]);

  // active가 false로 변경될 때 모든 상태 리셋
  useEffect(() => {
    if (!active) {
      console.log("🔄 Resetting FillingTank states for new verification cycle");
      setCurrentFill(0);
      setModalOpened(false);
      setAnimationStarted(false);

      // 모든 타이머와 애니메이션 정리
      if (modalTimerRef.current) {
        console.log("🛑 Clearing modal timer");
        clearTimeout(modalTimerRef.current);
        modalTimerRef.current = null;
      }
      if (animationRef.current) {
        console.log("🛑 Canceling animation frame during reset");
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      startTimeRef.current = null;
    }
  }, [active]);

  // clip-path 값 계산
  const clipValue = `inset(${100 - currentFill}% 0% 0% 0%)`;
  const tankImage = provingResult ? tankTrue : tankFalse;

  if (!active) return null;

  return (
    <div
      className="absolute max-w-full max-h-full object-contain top-[695px] right-[111px] flex items-end justify-end overflow-hidden z-[2]"
      style={{ background: "transparent" }}
    >
      <img
        src={tankImage}
        alt="tank-filled"
        className="w-full h-full object-contain"
        style={{
          clipPath: clipValue,
          WebkitClipPath: clipValue,
          transition: `clip-path ${animationDuration}ms linear, -webkit-clip-path ${animationDuration}ms linear`,
          userSelect: "none",
        }}
        draggable={false}
        onLoad={() => {
          console.log("🖼️ Tank image loaded, ready for animation");
          setImgLoaded(true);
        }}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import pipelineFilled from "../assets/images/pipe-filled.png";

interface PipelinesProps {
  id: string; // 각 파이프라인 컴포넌트의 고유 ID
  startX: number; // 시작 X 좌표 (px 또는 %)
  startY: number; // 시작 Y 좌표 (px 또는 %)
  endX: number; // 끝 X 좌표 (px 또는 %)
  endY: number; // 끝 Y 좌표 (px 또는 %)
  fillPercentage?: number; // 0-100 사이의 값으로 채워진 파이프라인의 표시 비율
  animationDuration?: number; // 애니메이션 지속 시간(ms)
  autoFill?: boolean; // 자동으로 채우기 여부
  direction?: "horizontal" | "vertical"; // 채우기 방향
  onFillComplete?: () => void; // 채우기가 완료되었을 때 호출되는 콜백
  delay?: number; // 애니메이션 시작 지연 시간 (ms)
  persistent?: boolean; // 채워진 상태 유지 여부 (true: 유지, false: 다음 컴포넌트 실행 시 초기화)
  fillHeight?: number; // 채우기 높이
  isPaused?: boolean; // 추가: 일시정지 플래그
}

// 전역 상태로 채워진 파이프라인 ID 관리
const filledPipelines: Set<string> = new Set();

export default function Pipelines({
  id,
  startX,
  startY,
  endX,
  endY,
  fillPercentage = 0,
  animationDuration = 1000,
  autoFill = false,
  direction = "horizontal",
  onFillComplete,
  delay = 0,
  persistent = true,
  fillHeight = 18,
  isPaused = false,
}: PipelinesProps) {
  const [currentFill, setCurrentFill] = useState(
    filledPipelines.has(id) ? 100 : fillPercentage
  );
  const filledImgRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const pausedRef = useRef(isPaused);

  // 컴포넌트 마운트 시 이미 채워진 상태인지 확인
  useEffect(() => {
    if (filledPipelines.has(id)) {
      setCurrentFill(100);
    }
  }, [id]);

  // 자동 채우기 애니메이션
  useEffect(() => {
    if (autoFill && !filledPipelines.has(id)) {
      // 지연 시간 후 애니메이션 시작
      delayTimeoutRef.current = setTimeout(() => {
        isAnimatingRef.current = true;

        const animate = (timestamp: number) => {
          if (pausedRef.current) {
            return;
          }
          if (startTimeRef.current === null) {
            startTimeRef.current = timestamp;
          }

          const elapsed = timestamp - startTimeRef.current;
          const progress = Math.min(elapsed / animationDuration, 1);

          // 이징 함수 적용 (ease-in-out)
          const easedProgress = easeInOutCubic(progress);
          setCurrentFill(easedProgress * 100);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // 애니메이션 완료
            isAnimatingRef.current = false;
            if (persistent) {
              filledPipelines.add(id); // 채워진 상태 저장
            }
            if (onFillComplete) {
              onFillComplete();
            }
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      }, delay);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (delayTimeoutRef.current) {
          clearTimeout(delayTimeoutRef.current);
        }
      };
    } else if (!autoFill) {
      // autoFill이 아닌 경우 props로 전달된 fillPercentage 사용
      setCurrentFill(filledPipelines.has(id) ? 100 : fillPercentage);

      // fillPercentage가 100이면 채워진 상태로 저장
      if (fillPercentage >= 100 && persistent) {
        filledPipelines.add(id);
      }
    }
  }, [
    autoFill,
    animationDuration,
    fillPercentage,
    id,
    persistent,
    delay,
    onFillComplete,
    pausedRef,
  ]);

  useEffect(() => {
    pausedRef.current = isPaused;
    if (!isPaused && isAnimatingRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPaused]);

  // 이징 함수 (부드러운 애니메이션을 위한 함수)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // animate 함수는 useEffect 바깥에 선언!
  const animate = (timestamp: number) => {
    if (pausedRef.current) {
      return;
    }
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / animationDuration, 1);

    const easedProgress = easeInOutCubic(progress);
    setCurrentFill(easedProgress * 100);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      isAnimatingRef.current = false;
      if (persistent) {
        filledPipelines.add(id);
      }
      if (onFillComplete) {
        onFillComplete();
      }
    }
  };

  // 이미지가 로드된 후 클립 패스 적용
  useEffect(() => {
    const updateClipPath = () => {
      if (filledImgRef.current) {
        let clipValue = "";

        if (direction === "horizontal") {
          // 수평 방향 채우기 (왼쪽에서 오른쪽 또는 오른쪽에서 왼쪽)
          const width = Math.abs(endX - startX);
          const fillWidth = width * (currentFill / 100);
          // const height = "25px";

          if (endX > startX) {
            // 왼쪽에서 오른쪽으로
            clipValue = `polygon(
              ${startX}px ${startY - 18}px, 
              ${startX + fillWidth}px ${startY - 18}px, 
              ${startX + fillWidth}px ${startY + fillHeight}px, 
              ${startX}px ${startY + fillHeight}px
            )`;
          } else {
            // 오른쪽에서 왼쪽으로
            clipValue = `polygon(
              ${startX}px ${startY - 18}px, 
              ${startX - fillWidth}px ${startY - 18}px, 
              ${startX - fillWidth}px ${startY + 18}px, 
              ${startX}px ${startY + 18}px
            )`;
          }
        } else {
          // 수직 방향 채우기 (위에서 아래로 또는 아래에서 위로)
          const height = Math.abs(endY - startY);
          const fillHeight = height * (currentFill / 100);

          if (endY > startY) {
            // 위에서 아래로
            clipValue = `polygon(
              ${startX - 18}px ${startY}px, 
              ${startX + 18}px ${startY}px, 
              ${startX + 18}px ${startY + fillHeight}px, 
              ${startX - 18}px ${startY + fillHeight}px
            )`;
          } else {
            // 아래에서 위로
            clipValue = `polygon(
              ${startX - 18}px ${startY}px, 
              ${startX + 18}px ${startY}px, 
              ${startX + 18}px ${startY - fillHeight}px, 
              ${startX - 18}px ${startY - fillHeight}px
            )`;
          }
        }

        filledImgRef.current.style.clipPath = clipValue;
      }
    };

    updateClipPath();
  }, [currentFill, startX, startY, endX, endY, direction]);

  return (
    <div className="absolute w-full h-full pointer-events-none">
      {/* 채워진 파이프라인 이미지 */}
      <img
        ref={filledImgRef}
        src={pipelineFilled}
        alt="pipeline-filled"
        className="absolute max-w-full max-h-full object-contain mt-[155px]"
        style={
          {
            // transition 속성 제거 - requestAnimationFrame으로 직접 제어
          }
        }
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import pipelineFilled from "../../assets/images/pipe-filled.png";

interface PipelinesProps {
  id: string; // 각 파이프라인 컴포넌트의 고유 ID
  startX: number; // 시작 X 좌표 (px)
  startY: number; // 시작 Y 좌표 (px)
  endX: number; // 끝 X 좌표 (px)
  endY: number; // 끝 Y 좌표 (px)
  fillPercentage?: number; // 0-100 사이의 값으로 채워진 파이프라인의 표시 비율
  animationDuration?: number; // 애니메이션 지속 시간(ms)
  autoFill?: boolean; // 자동으로 채우기 여부
  direction?: "horizontal" | "vertical"; // 채우기 방향
  onFillComplete?: () => void; // 채우기가 완료되었을 때 호출되는 콜백
  delay?: number; // 애니메이션 시작 지연 시간 (ms)
  persistent?: boolean; // 채워진 상태 유지 여부 (true: 유지, false: 다음 컴포넌트 실행 시 초기화)
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
}: PipelinesProps) {
  const [currentFill, setCurrentFill] = useState(
    filledPipelines.has(id) ? 100 : fillPercentage
  );
  const filledImgRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const hasCompletedRef = useRef<boolean>(false);

  // 컴포넌트 마운트 시 이미 채워진 상태인지 확인
  useEffect(() => {
    if (filledPipelines.has(id)) {
      setCurrentFill(100);
      updateClipPath(100);
    } else {
      updateClipPath(fillPercentage);
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [id, fillPercentage]);

  // autoFill 또는 fillPercentage 변경 시 애니메이션 업데이트
  useEffect(() => {
    // 이미 채워진 상태면 무시
    if (filledPipelines.has(id)) {
      return;
    }

    // 자동 채우기가 활성화되면 애니메이션 시작
    if (autoFill && !isAnimatingRef.current && !hasCompletedRef.current) {
      startAnimation();
    }
    // 자동 채우기가 아닌 경우 fillPercentage 값으로 설정
    else if (!autoFill) {
      setCurrentFill(fillPercentage);
      updateClipPath(fillPercentage);
    }
  }, [autoFill, fillPercentage, id]);

  // 애니메이션 시작 함수
  const startAnimation = () => {
    // 이전 애니메이션 정리
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }

    // 지연 시간 후 애니메이션 시작
    delayTimeoutRef.current = setTimeout(() => {
      isAnimatingRef.current = true;
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 이징 함수 적용 (ease-in-out)
        const easedProgress = easeInOutCubic(progress);
        const newFill = easedProgress * 100;

        setCurrentFill(newFill);
        updateClipPath(newFill);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // 애니메이션 완료
          isAnimatingRef.current = false;
          hasCompletedRef.current = true;

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
  };

  // 이징 함수 (부드러운 애니메이션을 위한 함수)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // 클립 패스 업데이트 함수
  const updateClipPath = (fillValue: number) => {
    if (!filledImgRef.current) return;

    let clipValue = "";

    if (direction === "horizontal") {
      // 수평 방향 채우기 (왼쪽에서 오른쪽 또는 오른쪽에서 왼쪽)
      const width = Math.abs(endX - startX);
      const fillWidth = width * (fillValue / 100);

      if (endX > startX) {
        // 왼쪽에서 오른쪽으로
        clipValue = `polygon(
          ${startX}px ${startY - 18}px, 
          ${startX + fillWidth}px ${startY - 18}px, 
          ${startX + fillWidth}px ${startY + 18}px, 
          ${startX}px ${startY + 18}px
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
      const fillHeight = height * (fillValue / 100);

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
  };

  return (
    <div className="absolute w-full h-full pointer-events-none">
      {/* 채워진 파이프라인 이미지 */}
      <img
        ref={filledImgRef}
        src={pipelineFilled}
        alt="pipeline-filled"
        className="absolute max-w-full max-h-full object-contain mt-[155px]"
      />
    </div>
  );
}

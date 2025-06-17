import React, { useEffect, useState, useRef } from "react";
import Pipelines from "../Pipelines";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";

// 파이프라인 세그먼트 정의
interface PipelineSegment {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  direction: "horizontal" | "vertical";
  animationDuration?: number;
  delay?: number; // 이전 세그먼트로부터의 지연 시간 (ms)
  fillHeight?: number; // 채우기 높이
}

interface PipelineSectionProps {
  id: string; // 섹션 ID
  segments: PipelineSegment[]; // 파이프라인 세그먼트 배열
  isActive: boolean; // 섹션 활성화 여부 (트리거)
  onComplete?: () => void; // 모든 세그먼트가 채워졌을 때 호출되는 콜백
  onStart?: () => void; // 추가
  baseDelay?: number; // 섹션 시작 기본 지연 시간 (ms)
  isPaused?: boolean; // 섹션 일시정지 여부
  resetAnimation?: boolean; // Add resetAnimation prop
}

export default function PipelineSection({
  id,
  segments,
  isActive,
  onComplete,
  onStart,
  baseDelay = 0,
  isPaused = false,
  resetAnimation,
}: PipelineSectionProps) {
  // 각 세그먼트의 활성화 상태 추적
  const [activeSegments, setActiveSegments] = useState<Record<string, boolean>>(
    {}
  );
  const completedSegmentsRef = useRef<Set<string>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const { resetAllAnimation } = usePipelineAnimation();

  // 모든 타임아웃 정리 함수
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // 세그먼트 완료 핸들러
  const handleSegmentComplete = (segmentId: string) => {
    completedSegmentsRef.current.add(segmentId);

    // 모든 세그먼트가 완료되었는지 확인
    if (completedSegmentsRef.current.size === segments.length && onComplete) {
      onComplete();
    }
  };

  // isActive 또는 resetAnimation 변경 시 애니메이션 시작/중지/초기화
  useEffect(() => {
    if (resetAnimation) {
      clearAllTimeouts();
      setActiveSegments({});
      completedSegmentsRef.current.clear();
      // Optionally, if you need to signal that reset is done, you could call a prop like onResetComplete here
      return; // Exit early if reset is active
    }

    if (isActive) {
      // console.log(`Section ${id} activated with baseDelay: ${baseDelay}ms`);

      if (onStart) onStart(); // 섹션 시작 시 콜백 호출

      // 이전 타임아웃 정리
      clearAllTimeouts();
      completedSegmentsRef.current.clear();

      // 각 세그먼트의 시작 시간 계산
      const segmentStartTimes: Record<string, number> = {};

      // 첫 번째 세그먼트는 baseDelay 후에 시작
      const firstSegment = segments[0];
      segmentStartTimes[firstSegment.id] = baseDelay;

      // 첫 번째 세그먼트 즉시 활성화 (baseDelay 후)
      const firstTimeout = setTimeout(() => {
        // console.log(
        //   `Activating first segment ${firstSegment.id} after ${baseDelay}ms`
        // );
        setActiveSegments((prev) => ({
          ...prev,
          [firstSegment.id]: true,
        }));
      }, baseDelay);

      timeoutsRef.current.push(firstTimeout);

      // 나머지 세그먼트들의 시작 시간 계산
      for (let i = 1; i < segments.length; i++) {
        const prevSegment = segments[i - 1];
        const currentSegment = segments[i];

        // 이전 세그먼트의 시작 시간
        const prevStartTime = segmentStartTimes[prevSegment.id];

        // 이전 세그먼트의 애니메이션 시간
        const prevDuration = prevSegment.animationDuration || 1000;

        // 현재 세그먼트의 지연 시간
        const currentDelay = currentSegment.delay || 0;

        // 현재 세그먼트의 시작 시간 계산
        const currentStartTime = prevStartTime + prevDuration + currentDelay;
        segmentStartTimes[currentSegment.id] = currentStartTime;

        // console.log(
        //   `Scheduling segment ${currentSegment.id} to start at ${currentStartTime}ms`
        // );
        // console.log(
        //   `  (prev start: ${prevStartTime}, prev duration: ${prevDuration}, delay: ${currentDelay})`
        // );

        // 현재 세그먼트 활성화 타임아웃 설정
        const timeout = setTimeout(() => {
          // console.log(
          //   `Activating segment ${currentSegment.id} after ${currentStartTime}ms`
          // );
          setActiveSegments((prev) => ({
            ...prev,
            [currentSegment.id]: true,
          }));
        }, currentStartTime);

        timeoutsRef.current.push(timeout);
      }
    } else {
      // 비활성화 시 모든 타임아웃 정리
      clearAllTimeouts();
      setActiveSegments({});
    }

    return () => {
      clearAllTimeouts();
    };
  }, [isActive, segments, baseDelay, resetAnimation]);

  return (
    <>
      {segments.map((segment) => (
        <Pipelines
          key={`${id}-${segment.id}`}
          id={`${id}-${segment.id}`}
          autoFill={activeSegments[segment.id] || false}
          animationDuration={segment.animationDuration || 1000}
          startX={segment.startX}
          startY={segment.startY}
          endX={segment.endX}
          endY={segment.endY}
          direction={segment.direction}
          persistent={true}
          delay={0} // 지연은 이 컴포넌트에서 직접 관리
          onFillComplete={() => handleSegmentComplete(segment.id)}
          fillHeight={segment.fillHeight}
          isPaused={isPaused}
          resetAnimation={resetAnimation}
        />
      ))}
    </>
  );
}

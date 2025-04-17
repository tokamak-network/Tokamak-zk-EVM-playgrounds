import React, { useEffect, useRef } from "react";

interface PipelinePixelAnimationProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  direction: "horizontal" | "vertical";
  isActive: boolean;
  animationDuration: number;
  delay?: number;
  pixelSize?: number;
  pixelDensity?: number;
  colors?: string[];
}

const PipelinePixelAnimation: React.FC<PipelinePixelAnimationProps> = ({
  startX,
  startY,
  endX,
  endY,
  direction,
  isActive,
  animationDuration,
  delay = 0,
  pixelSize = 6,
  pixelDensity = 2,
  colors = ["#365969", "#159CFC", "#7AC8FF", "#159CFC", "#0079D0", "#365969"],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const particlesRef = useRef<any[]>([]);

  // 파이프라인 방향 감지 (왼쪽→오른쪽, 오른쪽→왼쪽, 위→아래, 아래→위)
  const isRightToLeft = direction === "horizontal" && endX < startX;
  const isBottomToTop = direction === "vertical" && endY < startY;

  // 파이프라인 길이 및 위치 계산
  const pipelineWidth =
    direction === "horizontal" ? Math.abs(endX - startX) : 30;
  const pipelineHeight =
    direction === "vertical" ? Math.abs(endY - startY) : 20;

  // 파이프라인 시작 위치
  const pipelineLeft =
    direction === "horizontal" ? Math.min(startX, endX) : startX - 15;
  const pipelineTop =
    direction === "vertical" ? Math.min(startY, endY) : startY - 10;

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스 크기 설정
    canvas.width = pipelineWidth;
    canvas.height = pipelineHeight;

    // 파티클 초기화
    initParticles();

    // 디버깅 정보 출력
    console.log("Pipeline pixel animation initialized", {
      direction,
      startX,
      startY,
      endX,
      endY,
      isRightToLeft,
      isBottomToTop,
      pipelineWidth,
      pipelineHeight,
      pipelineLeft,
      pipelineTop,
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    pipelineWidth,
    pipelineHeight,
    startX,
    startY,
    endX,
    endY,
    direction,
    isRightToLeft,
    isBottomToTop,
  ]);

  // 파티클 초기화
  const initParticles = () => {
    // 파티클 수 계산
    const maxParticles = Math.max(
      50,
      Math.floor(
        ((pipelineWidth * pipelineHeight) / (pixelSize * pixelSize)) *
          pixelDensity
      )
    );
    particlesRef.current = [];

    for (let i = 0; i < maxParticles; i++) {
      particlesRef.current.push({
        x:
          direction === "horizontal"
            ? isRightToLeft
              ? pipelineWidth + pixelSize
              : -pixelSize
            : Math.random() * pipelineWidth,
        y:
          direction === "vertical"
            ? isBottomToTop
              ? pipelineHeight + pixelSize
              : -pixelSize
            : Math.random() * pipelineHeight,
        size: pixelSize - 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 1 + Math.random() * 0.4, // 속도 감소 (기존 1 + Math.random() * 2)
        active: false,
        alpha: 0.8 + Math.random() * 0.2,
        vx:
          direction === "horizontal"
            ? isRightToLeft
              ? -(0.5 + Math.random() * 0.3)
              : 0.5 + Math.random() * 0.3 // 속도 감소
            : -0.1 + Math.random() * 0.2, // 속도 감소
        vy:
          direction === "vertical"
            ? isBottomToTop
              ? -(0.5 + Math.random() * 0.3)
              : 0.5 + Math.random() * 0.3 // 속도 감소
            : -0.1 + Math.random() * 0.2, // 속도 감소
      });
    }
  };

  // 애니메이션 시작/중지
  useEffect(() => {
    if (isActive && !isAnimatingRef.current) {
      // 지연 시간 후 애니메이션 시작
      const timer = setTimeout(() => {
        isAnimatingRef.current = true;
        startTimeRef.current = performance.now();

        // 파티클 초기화
        particlesRef.current.forEach((p) => {
          p.active = false;
          if (direction === "horizontal") {
            p.x = isRightToLeft ? pipelineWidth + pixelSize : -pixelSize;
            p.y = Math.random() * pipelineHeight;
            p.vx = isRightToLeft
              ? -(1 + Math.random() * 0.5)
              : 1 + Math.random() * 0.5;
          } else {
            p.x = Math.random() * pipelineWidth;
            p.y = isBottomToTop ? pipelineHeight + pixelSize : -pixelSize;
            p.vy = isBottomToTop
              ? -(1 + Math.random() * 0.5)
              : 1 + Math.random() * 0.5;
          }
        });

        // 애니메이션 시작
        animate();

        console.log("Pipeline pixel animation started", {
          isRightToLeft,
          isBottomToTop,
        });
      }, delay);

      return () => clearTimeout(timer);
    } else if (!isActive && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, delay, isRightToLeft, isBottomToTop]);

  // 애니메이션 프레임
  const animate = () => {
    if (!isAnimatingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 현재 진행 상태 계산
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const progress = Math.min(elapsed / animationDuration, 1);

    // 클립 패스 적용 (애니메이션 진행에 따라)
    ctx.save();
    ctx.beginPath();
    if (direction === "horizontal") {
      if (isRightToLeft) {
        // 오른쪽에서 왼쪽으로
        ctx.rect(
          pipelineWidth * (1 - progress),
          0,
          pipelineWidth * progress,
          pipelineHeight
        );
      } else {
        // 왼쪽에서 오른쪽으로
        ctx.rect(0, 0, pipelineWidth * progress, pipelineHeight);
      }
    } else {
      if (isBottomToTop) {
        // 아래에서 위로
        ctx.rect(
          0,
          pipelineHeight * (1 - progress),
          pipelineWidth,
          pipelineHeight * progress
        );
      } else {
        // 위에서 아래로
        ctx.rect(0, 0, pipelineWidth, pipelineHeight * progress);
      }
    }
    ctx.clip();

    // 파티클 활성화 및 업데이트
    const particles = particlesRef.current;
    let activeCount = 0;

    // 매 프레임마다 일정 수의 파티클 활성화
    const activateCount = Math.floor(Math.random() * 3) + 2;
    let activated = 0;

    for (const particle of particles) {
      if (!particle.active) {
        // 비활성 파티클 활성화
        if (activated < activateCount && Math.random() < 0.1) {
          particle.active = true;
          activated++;

          if (direction === "horizontal") {
            if (isRightToLeft) {
              // 오른쪽에서 왼쪽으로
              particle.x = pipelineWidth + pixelSize;
              particle.y = Math.random() * pipelineHeight;
              particle.vx = -(1 + 0.001);
              particle.vy = -0.2 + Math.random() * 0.4;
            } else {
              // 왼쪽에서 오른쪽으로
              particle.x = -pixelSize;
              particle.y = Math.random() * pipelineHeight;
              particle.vx = 1 + 0.001;
              particle.vy = -0.2 + Math.random() * 0.4;
            }
          } else {
            if (isBottomToTop) {
              // 아래에서 위로
              particle.x = Math.random() * pipelineWidth;
              particle.y = pipelineHeight + pixelSize;
              particle.vx = -0.2 + Math.random() * 0.4;
              particle.vy = -(1 + 0.001);
            } else {
              // 위에서 아래로
              particle.x = Math.random() * pipelineWidth;
              particle.y = -pixelSize;
              particle.vx = -0.2 + Math.random() * 0.4;
              particle.vy = 1 + 0.001;
            }
          }
        }
        continue;
      }

      activeCount++;

      // 파티클 위치 업데이트
      particle.x += particle.vx;
      particle.y += particle.vy;

      // 화면 밖으로 나가면 비활성화
      const isOutOfBounds =
        direction === "horizontal"
          ? isRightToLeft
            ? particle.x < 0 || particle.x < pipelineWidth * (1 - progress)
            : particle.x > pipelineWidth ||
              particle.x > pipelineWidth * progress
          : isBottomToTop
            ? particle.y < 0 || particle.y < pipelineHeight * (1 - progress)
            : particle.y > pipelineHeight ||
              particle.y > pipelineHeight * progress;

      if (
        isOutOfBounds ||
        particle.x < -pixelSize ||
        particle.x > pipelineWidth + pixelSize ||
        particle.y < -pixelSize ||
        particle.y > pipelineHeight + pixelSize
      ) {
        particle.active = false;
        continue;
      }

      // 파티클 그리기 (그림자 효과 추가)
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;

      // 그림자 효과
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillRect(
        Math.floor(particle.x),
        Math.floor(particle.y),
        particle.size,
        particle.size
      );
    }

    ctx.restore();

    // 애니메이션 완료 체크
    if (progress >= 1 && activeCount === 0) {
      isAnimatingRef.current = false;
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="absolute w-full h-full mt-[155px]">
      <canvas
        ref={canvasRef}
        className=""
        style={{
          position: "absolute",
          left: pipelineLeft,
          top: pipelineTop,
          width: pipelineWidth,
          height: pipelineHeight,
          opacity: 1,
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 1,
          // border:
          //   process.env.NODE_ENV === "development" ? "1px solid red" : "none", // 개발 환경에서만 경계 표시
        }}
      />
    </div>
  );
};

export default PipelinePixelAnimation;

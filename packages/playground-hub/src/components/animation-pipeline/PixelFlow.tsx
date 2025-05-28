import React, { useRef, useEffect } from "react";

interface PixelFlowProps {
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
  className?: string;
  onAnimationComplete?: () => void;
}

const PixelFlow: React.FC<PixelFlowProps> = ({
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
  className,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const particlesRef = useRef<any[]>([]);

  // 파이프라인 방향 감지
  const isRightToLeft = direction === "horizontal" && endX < startX;
  const isBottomToTop = direction === "vertical" && endY < startY;

  // 파이프라인 길이 및 위치 계산
  const pipelineWidth =
    direction === "horizontal" ? Math.abs(endX - startX) : 20;
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

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    pipelineWidth,
    pipelineHeight,
    direction,
    isRightToLeft,
    isBottomToTop,
    pixelSize,
    pixelDensity,
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
        speed: 0.3 + Math.random() * 0.4,
        active: false,
        alpha: 0.8 + Math.random() * 0.2,
        vx:
          direction === "horizontal"
            ? isRightToLeft
              ? -0.5
              : 0.5
            : -0.1 + Math.random() * 0.2,
        vy:
          direction === "vertical"
            ? isBottomToTop
              ? -0.5
              : 0.5
            : -0.1 + Math.random() * 0.2,
      });
    }
  };

  // 애니메이션 시작/중지
  useEffect(() => {
    if (isActive && !isAnimatingRef.current) {
      const timer = setTimeout(() => {
        isAnimatingRef.current = true;
        startTimeRef.current = performance.now();

        // 파티클 초기화
        particlesRef.current.forEach((p) => {
          p.active = false;
          if (direction === "horizontal") {
            p.x = isRightToLeft ? pipelineWidth + pixelSize : -pixelSize;
            p.y = Math.random() * pipelineHeight;
            p.vx = isRightToLeft ? -0.5 : 0.5;
          } else {
            p.x = Math.random() * pipelineWidth;
            p.y = isBottomToTop ? pipelineHeight + pixelSize : -pixelSize;
            p.vy = isBottomToTop ? -0.5 : 0.5;
          }
        });

        // 애니메이션 시작
        animate(performance.now());
      }, delay);

      return () => clearTimeout(timer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [
    isActive,
    delay,
    direction,
    isRightToLeft,
    isBottomToTop,
    pipelineWidth,
    pipelineHeight,
    pixelSize,
    animationDuration,
  ]);

  // 애니메이션 프레임
  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 경과 시간 계산
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(1, elapsed / animationDuration);

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 파티클 활성화 및 업데이트
    const particles = particlesRef.current;
    let activeCount = 0;

    // 매 프레임마다 더 많은 파티클 활성화
    const activateCount = Math.floor(Math.random() * 5) + 2;
    let activated = 0;

    ctx.save();

    for (const particle of particles) {
      if (!particle.active) {
        // 비활성 파티클 활성화
        if (activated < activateCount && Math.random() < 0.15) {
          particle.active = true;
          activated++;

          if (direction === "horizontal") {
            if (isRightToLeft) {
              // 오른쪽에서 왼쪽으로
              particle.x = pipelineWidth + pixelSize;
              particle.y = Math.random() * pipelineHeight;
              particle.vx = -0.5 - Math.random() * 0.5;
              particle.vy = -0.1 + Math.random() * 0.2;
            } else {
              // 왼쪽에서 오른쪽으로
              particle.x = -pixelSize;
              particle.y = Math.random() * pipelineHeight;
              particle.vx = 0.5 + Math.random() * 0.5;
              particle.vy = -0.1 + Math.random() * 0.2;
            }
          } else {
            if (isBottomToTop) {
              // 아래에서 위로
              particle.x = Math.random() * pipelineWidth;
              particle.y = pipelineHeight + pixelSize;
              particle.vx = -0.1 + Math.random() * 0.2;
              particle.vy = -0.5 - Math.random() * 0.5;
            } else {
              // 위에서 아래로
              particle.x = Math.random() * pipelineWidth;
              particle.y = -pixelSize;
              particle.vx = -0.1 + Math.random() * 0.2;
              particle.vy = 0.5 + Math.random() * 0.5;
            }
          }
        }
        continue;
      }

      activeCount++;

      // 파티클 위치 업데이트
      const speedScale = 1.2;
      particle.x += particle.vx * speedScale;
      particle.y += particle.vy * speedScale;

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
    if (progress >= 1) {
      // 진행도가 100%에 도달하면 애니메이션 종료
      isAnimatingRef.current = false;

      // 모든 파티클 비활성화
      particlesRef.current.forEach((p) => (p.active = false));

      // 마지막 프레임 그리기
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 애니메이션 완료 콜백 호출
      if (onAnimationComplete) {
        onAnimationComplete();
      }

      // 애니메이션 종료
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className={`absolute w-full h-full mt-[155px] ${className || ""}`}>
      <canvas
        ref={canvasRef}
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
        }}
      />
    </div>
  );
};

export default PixelFlow;

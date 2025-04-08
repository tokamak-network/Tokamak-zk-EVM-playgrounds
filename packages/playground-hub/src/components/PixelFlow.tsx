import React, { useEffect, useRef } from "react";

interface PixelFlowProps {
  className?: string;
  pipelinePath?: { x: number; y: number }[];
  maxPixels?: number;
  animationSpeed?: number;
  maxYCells?: number;
  maxXCells?: number;
}

const PixelFlow: React.FC<PixelFlowProps> = ({
  className,
  pipelinePath,
  maxPixels: userMaxPixels,
  animationSpeed = 1,
  maxYCells = 50, // Y축 길이 조절
  maxXCells = 6, // X축 범위 (열 수)
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // maxPixels를 maxXCells * maxYCells에 비례하게 설정
    // 기본값은 각 셀당 평균 1.5개의 픽셀 (적절한 밀도를 위해)
    const maxPixels =
      userMaxPixels || Math.max(300, Math.ceil(maxXCells * maxYCells * 1.5));

    console.log("PixelFlow mounted with:", { maxYCells, maxXCells, maxPixels });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정
    const updateCanvasSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    updateCanvasSize();

    // 픽셀 크기 설정
    const PIXEL_SIZE = 6;

    // 색상 배열 (X축 열별)
    const colors = [
      "#0079D0", // 첫번째 열 - 진한 파란색
      "#365969", // 두번째 열 - 진한 회청색
      "#159CFC", // 세번째 열 - 밝은 파란색
      "#7AC8FF", // 네번째 열 - 하늘색
      "#159CFC", // 다섯번째 열 - 밝은 파란색
      "#0079D0", // 여섯번째 열 - 진한 파란색
    ];

    // 시작점 설정
    const startPoint =
      pipelinePath && pipelinePath.length > 0
        ? pipelinePath[0]
        : { x: canvas.width / 2, y: 50 };

    // 시작점의 그리드 좌표
    const startGridX = Math.floor(startPoint.x / PIXEL_SIZE);
    const startGridY = Math.floor(startPoint.y / PIXEL_SIZE);

    // 고정된 픽셀 저장 (그리드 좌표 -> 색상)
    const fixedPixels = new Map<string, string>();

    // 파티클 클래스 정의
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      column: number;

      constructor() {
        this.reset();
      }

      reset() {
        // 0부터 maxXCells-1 사이의 열 인덱스 선택
        this.column = Math.floor(Math.random() * maxXCells);

        // X 좌표 계산 (시작점 + 열 인덱스)
        this.x = (startGridX + this.column) * PIXEL_SIZE;

        // Y 좌표는 시작점
        this.y = startGridY * PIXEL_SIZE;

        // 속도 설정
        this.vx = (-0.1 + Math.random() * 0.2) * animationSpeed;
        this.vy = (0.5 + Math.random() * 0.5) * animationSpeed;

        // 색상 설정 (열 인덱스에 해당하는 색상)
        this.color = colors[Math.min(this.column, colors.length - 1)];

        // 알파값 설정
        this.alpha = 1;
      }

      update() {
        // 위치 업데이트
        this.x += this.vx;
        this.y += this.vy;

        // 알파값 감소
        this.alpha -= 0.005 * animationSpeed;

        // 그리드 좌표 계산
        const gridX = Math.floor(this.x / PIXEL_SIZE);
        const gridY = Math.floor(this.y / PIXEL_SIZE);

        // X축 범위 체크
        const inXRange = gridX >= startGridX && gridX < startGridX + maxXCells;

        // Y축 최대 길이 체크
        const maxGridY = startGridY + maxYCells;
        const inYRange = gridY <= maxGridY;

        // 범위 내에 있고 알파값이 충분히 높으면 고정 픽셀로 설정
        if (inXRange && inYRange && this.alpha > 0.7) {
          const key = `${gridX},${gridY}`;
          if (!fixedPixels.has(key)) {
            fixedPixels.set(key, this.color);
          }
        }

        // 범위를 벗어나거나 알파값이 0 이하면 재설정
        if (!inXRange || !inYRange || this.alpha <= 0) {
          this.reset();
        }
      }

      draw() {
        if (this.alpha <= 0) return;

        // 그리드 좌표 계산
        const gridX = Math.floor(this.x / PIXEL_SIZE);
        const gridY = Math.floor(this.y / PIXEL_SIZE);

        // X축 범위 체크
        const inXRange = gridX >= startGridX && gridX < startGridX + maxXCells;

        // Y축 최대 길이 체크
        const maxGridY = startGridY + maxYCells;
        const inYRange = gridY <= maxGridY;

        // 범위 내에 있으면 그리기
        if (inXRange && inYRange) {
          ctx!.globalAlpha = this.alpha;
          ctx!.fillStyle = this.color;
          ctx!.fillRect(
            gridX * PIXEL_SIZE,
            gridY * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE
          );
        }
      }
    }

    // 파티클 배열 생성
    const particles: Particle[] = [];
    for (let i = 0; i < maxPixels; i++) {
      particles.push(new Particle());
    }

    // 초기 행 설정
    for (let x = 0; x < maxXCells; x++) {
      const gridX = startGridX + x;
      const key = `${gridX},${startGridY}`;
      fixedPixels.set(key, colors[Math.min(x, colors.length - 1)]);
    }

    // 애니메이션 함수
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 경계선 그리기 (디버깅용)
      const maxGridY = startGridY + maxYCells;

      // Y축 최대 경계선
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(0, maxGridY * PIXEL_SIZE);
      ctx.lineTo(canvas.width, maxGridY * PIXEL_SIZE);
      ctx.stroke();

      // X축 경계선
      ctx.strokeStyle = "yellow";
      ctx.beginPath();
      ctx.moveTo(startGridX * PIXEL_SIZE, 0);
      ctx.lineTo(startGridX * PIXEL_SIZE, canvas.height);
      ctx.stroke();

      ctx.strokeStyle = "yellow";
      ctx.beginPath();
      ctx.moveTo((startGridX + maxXCells) * PIXEL_SIZE, 0);
      ctx.lineTo((startGridX + maxXCells) * PIXEL_SIZE, canvas.height);
      ctx.stroke();

      // 고정된 픽셀 그리기
      fixedPixels.forEach((color, key) => {
        const [x, y] = key.split(",").map(Number);

        // X축 범위 체크
        const inXRange = x >= startGridX && x < startGridX + maxXCells;

        // Y축 범위 체크
        const inYRange = y <= maxGridY;

        if (inXRange && inYRange) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = color;
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      });

      // 파티클 업데이트 및 그리기
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      // 디버깅 정보
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.globalAlpha = 1;
      ctx.fillText(`maxYCells: ${maxYCells}`, 10, 20);
      ctx.fillText(`maxXCells: ${maxXCells}`, 10, 40);
      ctx.fillText(`maxPixels: ${maxPixels}`, 10, 60);
      ctx.fillText(
        `X range: ${startGridX} to ${startGridX + maxXCells - 1}`,
        10,
        80
      );

      requestAnimationFrame(animate);
    }

    // 애니메이션 시작
    const animationId = requestAnimationFrame(animate);

    // 리사이즈 이벤트 처리
    window.addEventListener("resize", updateCanvasSize);

    // 클린업
    return () => {
      console.log("PixelFlow unmounted");
      window.removeEventListener("resize", updateCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [pipelinePath, userMaxPixels, animationSpeed, maxYCells, maxXCells]);

  return (
    <canvas
      ref={canvasRef}
      className={`pixel-flow-canvas ${className || ""}`}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 5,
        backgroundColor: "transparent",
        pointerEvents: "none",
      }}
    />
  );
};

export default PixelFlow;

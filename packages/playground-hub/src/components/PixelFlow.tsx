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
  maxPixels = 300,
  animationSpeed = 1,
  maxYCells = 20, // 아래로 더 많은 셀 허용
  maxXCells = 6, // X포인트 포함 오른쪽으로 6칸
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width: number, height: number;
    let pixels: Array<[number, number, number, number, string, number]> = [];
    let coloredPixels: Array<{
      x: number;
      y: number;
      alpha: number;
      color: string;
      vx: number;
      vy: number;
    }> = [];

    // 이미지에 맞게 X축 기준 색상 배열 (열별)
    const colors = [
      "#365969", // 첫번째 열 - 진한 파란색
      "#159CFC", // 두번째 열 - 진한 회청색
      "#7AC8FF", // 세번째 열 - 밝은 파란색
      "#159CFC", // 네번째 열 - 하늘색
      "#0079D0", // 다섯번째 열 - 밝은 파란색
      "#365969", // 여섯번째 열 - 진한 파란색
    ];

    let currentPixel = 0;

    // 픽셀 크기와 그리드 간격을 6px로 설정
    const PIXEL_SIZE = 6;
    const GRID_SIZE = 6;

    // 시작점 설정 (파이프라인 경로 또는 기본값)
    const defaultPoint = { x: canvas.width / 2, y: 50 };
    const xPoint =
      pipelinePath && pipelinePath.length > 0 ? pipelinePath[0] : defaultPoint;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;

      // 그리드 초기화
      pixels = [];

      // 전체 화면에 그리드 생성
      for (let y = 0; y < Math.ceil(height / GRID_SIZE); y++) {
        for (let x = 0; x < Math.ceil(width / GRID_SIZE); x++) {
          pixels.push([
            x * GRID_SIZE,
            y * GRID_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE,
            "transparent", // 배경 투명
            0, // 알파값 0으로 설정
          ]);
        }
      }
    };

    const initColoredPixels = () => {
      coloredPixels = [];
      for (let i = 0; i < maxPixels; i++) {
        coloredPixels.push({
          x: xPoint.x,
          y: xPoint.y,
          alpha: 0,
          color: colors[i % colors.length],
          vx: (-0.3 + Math.random() * 0.6) * animationSpeed, // X 방향 속도 감소
          vy: (0.5 + Math.random() * 0.5) * animationSpeed, // Y 방향은 항상 양수 (아래로만)
        });
      }
    };

    const launchPixel = () => {
      coloredPixels[currentPixel].x = xPoint.x + (-5 + Math.random() * 10); // 약간의 X 변동
      coloredPixels[currentPixel].y = xPoint.y;
      coloredPixels[currentPixel].alpha = 1;

      // 속도 재설정 - 아래로만 이동하도록
      coloredPixels[currentPixel].vx =
        (-0.3 + Math.random() * 0.6) * animationSpeed;
      coloredPixels[currentPixel].vy =
        (0.5 + Math.random() * 0.5) * animationSpeed;

      currentPixel++;
      if (currentPixel >= maxPixels) currentPixel = 0;
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, width, height);

      // 컬러 픽셀 업데이트
      for (let i = 0; i < coloredPixels.length; i++) {
        // 픽셀 위치를 그리드 인덱스로 변환
        const gridX = Math.floor(coloredPixels[i].x / GRID_SIZE);
        const gridY = Math.floor(coloredPixels[i].y / GRID_SIZE);

        // X포인트 기준 열 인덱스 계산
        const xPointGridX = Math.floor(xPoint.x / GRID_SIZE);
        const relativeX = gridX - xPointGridX;

        // X포인트와 오른쪽 5칸 (총 6칸) 내에 있는지 확인
        if (relativeX >= 0 && relativeX < maxXCells) {
          const pix = gridY * Math.ceil(width / GRID_SIZE) + gridX;

          if (pix >= 0 && pix < pixels.length) {
            // 해당 열에 맞는 색상 적용
            pixels[pix][4] = colors[relativeX];
            pixels[pix][5] = coloredPixels[i].alpha;
          }
        }

        // 알파값 감소
        if (coloredPixels[i].alpha > 0)
          coloredPixels[i].alpha -= 0.008 * animationSpeed;
        if (coloredPixels[i].alpha < 0) coloredPixels[i].alpha = 0;

        // 위치 업데이트
        coloredPixels[i].x += coloredPixels[i].vx;
        coloredPixels[i].y += coloredPixels[i].vy;
      }

      // 픽셀 그리기 (배경 그리지 않음)
      for (let i = 0; i < pixels.length; i++) {
        if (pixels[i][5] > 0) {
          ctx.globalAlpha = pixels[i][5];
          ctx.fillStyle = pixels[i][4];
          ctx.fillRect(pixels[i][0], pixels[i][1], pixels[i][2], pixels[i][3]);
        }
      }
    };

    const draw = () => {
      launchPixel();
      drawGrid();
      animationFrameId = requestAnimationFrame(draw);
    };

    // 초기화 및 애니메이션 시작
    resize();
    initColoredPixels();

    let animationFrameId = requestAnimationFrame(draw);

    // 리사이즈 이벤트 처리
    const handleResize = () => {
      resize();
      initColoredPixels();
    };

    window.addEventListener("resize", handleResize);

    // 클린업 함수
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pipelinePath, maxPixels, animationSpeed, maxYCells, maxXCells]);

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

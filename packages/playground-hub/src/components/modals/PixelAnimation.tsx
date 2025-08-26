import React from "react";
import { Pixel } from "../../utils/imageToPixels";
import planetSvg from "../../assets/planet.svg";

interface PixelAnimationProps {
  pixels: Pixel[];
  containerWidth: number;
  containerHeight: number;
  pixelSize?: number;
  showTrail?: boolean;
}

interface PixelComponentProps {
  pixel: Pixel;
  pixelSize: number;
  showTrail: boolean;
  containerWidth: number;
  containerHeight: number;
}

const PixelComponent: React.FC<PixelComponentProps> = ({
  pixel,
  pixelSize,
  showTrail,
  containerWidth,
  containerHeight,
}) => {
  const [isFlying, setIsFlying] = React.useState(true);
  const [hasLanded, setHasLanded] = React.useState(false);

  React.useEffect(() => {
    // 픽셀이 생성되면 잠시 후 날아가기 시작
    const flyTimer = setTimeout(() => {
      setIsFlying(false);
    }, pixel.delay);

    // 날아간 후 착지 효과
    const landTimer = setTimeout(() => {
      setHasLanded(true);
    }, pixel.delay + 300); // 300ms는 비행 시간

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(landTimer);
    };
  }, [pixel.delay]);

  // 픽셀 위치에 따른 z-index 계산 (겹침 방지)
  const zIndex = pixel.stage * 100 + pixel.y * 10 + pixel.x;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${pixel.x}px`,
    top: `${pixel.y}px`,
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
    overflow: "hidden",
    transition: "transform 300ms ease-out, box-shadow 200ms ease-in-out",
    transform: isFlying ? "translateX(-120px) translateZ(0)" : "translateZ(0)",
    zIndex: zIndex,

    // 완전한 픽셀 퍼펙트 렌더링
    imageRendering: "pixelated",
    imageRendering: "-moz-crisp-edges" as any,
    imageRendering: "-webkit-crisp-edges" as any,
    imageRendering: "crisp-edges" as any,

    // 하드웨어 가속 및 정확한 픽셀 배치
    backfaceVisibility: "hidden",
    willChange: "transform",

    // 경계선 완전 제거
    border: "none",
    outline: "none",
    boxSizing: "border-box",
    margin: "0",
    padding: "0",
  };

  // 트레일 효과
  if (showTrail && !isFlying && !hasLanded) {
    baseStyle.boxShadow = `
      -2px 0 2px rgba(255, 255, 255, 0.3),
      -4px 0 4px rgba(255, 255, 255, 0.2),
      -6px 0 6px rgba(255, 255, 255, 0.1)
    `;
  }

  // 착지 반짝임 효과
  if (hasLanded) {
    baseStyle.boxShadow = `
      0 0 4px rgba(255, 255, 255, 0.8),
      0 0 8px rgba(255, 255, 255, 0.4)
    `;

    // 반짝임 제거
    setTimeout(() => {
      setHasLanded(false);
    }, 200);
  }

  return (
    <div style={baseStyle}>
      {/* 원본 이미지를 클립하여 해당 픽셀 영역만 보이게 함 */}
      <img
        src={planetSvg}
        alt=""
        style={{
          position: "absolute",
          left: `-${pixel.x}px`,
          top: `-${pixel.y}px`,
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,

          // 픽셀 퍼펙트 렌더링
          imageRendering: "pixelated",
          imageRendering: "-moz-crisp-edges" as any,
          imageRendering: "-webkit-crisp-edges" as any,
          imageRendering: "crisp-edges" as any,

          // 스무딩 완전 비활성화
          WebkitFontSmoothing: "none" as any,
          MozOsxFontSmoothing: "unset" as any,
          fontSmooth: "never" as any,

          // 배경색 처리 - 모달 배경색과 동일하게
          backgroundColor: "#BDBDBD",

          // CSS 필터로 흰색/밝은 색상 조정
          filter: "contrast(1.1) brightness(0.95)",

          // 혼합 모드로 배경 투명화 (실험적)
          mixBlendMode: "multiply" as any,
        }}
      />
    </div>
  );
};

export const PixelAnimation: React.FC<PixelAnimationProps> = ({
  pixels,
  containerWidth,
  containerHeight,
  pixelSize = 2,
  showTrail = true,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        overflow: "hidden",

        // 컨테이너 픽셀 퍼펙트 렌더링
        imageRendering: "pixelated",
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "-webkit-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,

        // 스무딩 완전 비활성화
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,

        // 하드웨어 가속
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      {pixels.map((pixel) => (
        <PixelComponent
          key={pixel.id}
          pixel={pixel}
          pixelSize={pixelSize}
          showTrail={showTrail}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      ))}
    </div>
  );
};

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
  // 애니메이션 비활성화 - 모든 픽셀을 즉시 최종 위치에 표시
  const [isFlying, setIsFlying] = React.useState(false); // 즉시 착지 상태
  const [hasLanded, setHasLanded] = React.useState(false);

  // 애니메이션 효과 완전 비활성화
  // React.useEffect(() => {
  //   // 픽셀이 생성되면 잠시 후 날아가기 시작
  //   const flyTimer = setTimeout(() => {
  //     setIsFlying(false);
  //   }, pixel.delay);

  //   // 날아간 후 착지 효과
  //   const landTimer = setTimeout(() => {
  //     setHasLanded(true);
  //   }, pixel.delay + 300); // 300ms는 비행 시간

  //   return () => {
  //     clearTimeout(flyTimer);
  //     clearTimeout(landTimer);
  //   };
  // }, [pixel.delay]);

  // 픽셀 위치에 따른 z-index 계산 (겹침 방지)
  const zIndex = pixel.stage * 100 + pixel.y * 10 + pixel.x;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${pixel.x}px`,
    top: `${pixel.y}px`,
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
    overflow: "hidden",
    // 픽셀을 즉시 최종 위치에 고정 (애니메이션 비활성화)
    transform: "translate3d(0,0,0)",
    zIndex: zIndex,

    // 완전한 픽셀 퍼펙트 렌더링 (강화)
    imageRendering: "pixelated",
    imageRendering: "-moz-crisp-edges" as any,
    imageRendering: "-webkit-crisp-edges" as any,
    imageRendering: "crisp-edges" as any,
    imageRendering: "-webkit-optimize-contrast" as any,

    // 모든 스무딩 완전 비활성화
    WebkitFontSmoothing: "none" as any,
    MozOsxFontSmoothing: "unset" as any,
    fontSmooth: "never" as any,

    // 브라우저 줌/스케일링 보정
    zoom: 1,
    filter: "none",

    // 픽셀 경계 강화
    border: "0.5px solid transparent",

    // 하드웨어 가속
    backfaceVisibility: "hidden",
    willChange: "transform",

    // 경계선 완전 제거
    border: "none",
    outline: "none",
    boxSizing: "border-box",
    margin: "0",
    padding: "0",
  };

  // 박스 쉐도우 효과 완전 제거
  // 트레일 효과와 착지 반짝임 효과를 모두 비활성화

  return (
    <div
      style={{
        ...baseStyle,
        // 각 픽셀의 실제 색상 사용 (배경 픽셀은 제외됨)
        backgroundColor: pixel.color,
      }}
    />
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

        // 컨테이너 픽셀 퍼펙트 렌더링 (CodePen 스타일)
        imageRendering: "pixelated",
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "-webkit-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,
        imageRendering: "-webkit-optimize-contrast" as any,

        // 스무딩 완전 비활성화
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,

        // 텍스트 렌더링 최적화
        textRendering: "optimizeSpeed" as any,

        // 하드웨어 가속 및 픽셀 정렬
        transform: "translate3d(0,0,0)",
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

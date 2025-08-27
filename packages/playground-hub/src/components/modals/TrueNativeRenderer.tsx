import React from "react";
import planetSvg from "../../assets/planet.svg";

interface TrueNativeRendererProps {
  containerWidth?: number;
  containerHeight?: number;
}

export const TrueNativeRenderer: React.FC<TrueNativeRendererProps> = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "80px", // SVG 원본 크기 그대로
        height: "50px", // SVG 원본 크기 그대로
        // 완전한 픽셀 퍼펙트 설정
        imageRendering: "pixelated",
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        // SVG 렌더링 최적화
        shapeRendering: "crispEdges" as any,
        textRendering: "geometricPrecision" as any,
      }}
    >
      <img
        src={planetSvg}
        alt="True Native Planet"
        style={{
          width: "80px", // 정확히 SVG 원본 크기
          height: "50px", // 정확히 SVG 원본 크기
          // 스케일링 완전 방지
          imageRendering: "pixelated",

          // 모든 브라우저 스무딩 비활성화
          WebkitFontSmoothing: "none" as any,
          MozOsxFontSmoothing: "unset" as any,
          fontSmooth: "never" as any,

          // 하드웨어 가속 최적화
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          willChange: "transform",

          // 정확한 픽셀 렌더링
          display: "block",
          border: "none",
          outline: "none",
          margin: 0,
          padding: 0,

          // SVG 특화 설정
          shapeRendering: "crispEdges" as any,
          textRendering: "geometricPrecision" as any,

          // 브라우저 기본 이미지 처리 비활성화
          objectFit: "none" as any,
          objectPosition: "0 0",
        }}
      />
    </div>
  );
};

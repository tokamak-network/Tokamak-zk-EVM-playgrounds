import React from "react";
import planetSvg from "../../assets/planet.svg";

interface SimplePixelRendererProps {
  containerWidth: number;
  containerHeight: number;
}

export const SimplePixelRenderer: React.FC<SimplePixelRendererProps> = ({
  containerWidth,
  containerHeight,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        overflow: "hidden",
      }}
    >
      {/* Render at very small size then scale up */}
      <img
        src={planetSvg}
        alt="Simple Pixel Planet"
        style={{
          // Render at 1/4 size first
          width: "20px", // 80/4
          height: "12.5px", // 50/4

          // Scale up by 4x to fill container
          transform: `scale(${containerWidth / 20}, ${containerHeight / 12.5})`,
          transformOrigin: "0 0",

          // Pixel-perfect rendering
          imageRendering: "pixelated",

          // Disable smoothing
          WebkitFontSmoothing: "none" as any,
          MozOsxFontSmoothing: "unset" as any,
          fontSmooth: "never" as any,

          // Hardware acceleration
          backfaceVisibility: "hidden",
          willChange: "transform",

          display: "block",
          border: "none",
          outline: "none",
        }}
      />
    </div>
  );
};

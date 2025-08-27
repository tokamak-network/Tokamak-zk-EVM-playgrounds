import React from "react";
import planetSvg from "../../assets/planet.svg";

interface CSSPixelatedRendererProps {
  containerWidth: number;
  containerHeight: number;
  pixelSize?: number;
}

export const CSSPixelatedRenderer: React.FC<CSSPixelatedRendererProps> = ({
  containerWidth,
  containerHeight,
  pixelSize = 4,
}) => {
  // Calculate the size for pixelation effect
  const smallWidth = Math.floor(containerWidth / pixelSize);
  const smallHeight = Math.floor(containerHeight / pixelSize);

  return (
    <div
      style={{
        position: "relative",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        overflow: "hidden",
      }}
    >
      {/* First render small, then scale up for pixelation effect */}
      <img
        src={planetSvg}
        alt="CSS Pixelated Planet"
        style={{
          // First scale down to create pixelation
          width: `${smallWidth}px`,
          height: `${smallHeight}px`,

          // Then scale back up with no smoothing
          transform: `scale(${pixelSize})`,
          transformOrigin: "0 0",

          // Disable all smoothing
          imageRendering: "pixelated",
          imageRendering: "-moz-crisp-edges" as any,
          imageRendering: "-webkit-crisp-edges" as any,
          imageRendering: "crisp-edges" as any,

          // Additional pixel-perfect settings
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

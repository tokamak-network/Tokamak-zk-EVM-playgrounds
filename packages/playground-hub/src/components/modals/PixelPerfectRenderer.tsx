import React, { useRef, useEffect, useState } from "react";
import planetSvg from "../../assets/planet.svg";

interface PixelPerfectRendererProps {
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
}

interface PixelData {
  x: number;
  y: number;
  color: string;
}

export const PixelPerfectRenderer: React.FC<PixelPerfectRendererProps> = ({
  containerWidth,
  containerHeight,
  pixelSize,
}) => {
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPixels = async () => {
      try {
        setIsLoading(true);

        // Create image element
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = planetSvg;
        });

        // Create canvas with exact SVG dimensions
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        // Use original SVG dimensions
        canvas.width = 80;
        canvas.height = 50;

        // Disable all smoothing
        ctx.imageSmoothingEnabled = false;
        (ctx as any).webkitImageSmoothingEnabled = false;
        (ctx as any).mozImageSmoothingEnabled = false;
        (ctx as any).msImageSmoothingEnabled = false;
        (ctx as any).oImageSmoothingEnabled = false;

        // Draw image at original size
        ctx.drawImage(img, 0, 0, 80, 50);

        // Extract pixel data
        const imageData = ctx.getImageData(0, 0, 80, 50);
        const data = imageData.data;
        const extractedPixels: PixelData[] = [];

        // Process every pixel
        for (let y = 0; y < 50; y++) {
          for (let x = 0; x < 80; x++) {
            const index = (y * 80 + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            // Only include non-transparent pixels that aren't background
            if (a > 0) {
              const brightness = (r + g + b) / 3;
              const isBackground =
                brightness > 230 || (r > 240 && g > 240 && b > 240);

              if (!isBackground) {
                extractedPixels.push({
                  x,
                  y,
                  color: `rgb(${r}, ${g}, ${b})`,
                });
              }
            }
          }
        }

        console.log(
          `Extracted ${extractedPixels.length} pixels from 80x50 SVG`
        );
        setPixels(extractedPixels);
      } catch (error) {
        console.error("Error loading pixels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPixels();
  }, []);

  if (isLoading) {
    return <div>Loading pixels...</div>;
  }

  // Use integer scaling only - no fractional pixels
  const scaleX = Math.floor(containerWidth / 80);
  const scaleY = Math.floor(containerHeight / 50);
  const actualScale = Math.max(scaleX, scaleY, 1); // At least 1x scale

  return (
    <div
      style={{
        position: "relative",
        width: `${80 * actualScale}px`,
        height: `${50 * actualScale}px`,
        // Completely disable any browser rendering optimizations
        imageRendering: "pixelated",
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        // Ensure no anti-aliasing
        shapeRendering: "crispEdges" as any,
        textRendering: "geometricPrecision" as any,
      }}
    >
      {pixels.map((pixel, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            // Use integer coordinates only
            left: `${pixel.x * actualScale}px`,
            top: `${pixel.y * actualScale}px`,
            width: `${actualScale}px`,
            height: `${actualScale}px`,
            backgroundColor: pixel.color,
            // Ensure crisp pixel rendering
            imageRendering: "pixelated",
            border: "none",
            outline: "none",
            margin: 0,
            padding: 0,
            // Prevent any sub-pixel rendering
            transform: "translate3d(0, 0, 0)",
            // Force pixel boundaries
            boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
};

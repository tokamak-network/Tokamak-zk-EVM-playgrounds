import React, { useRef, useEffect, useState } from "react";
import planetSvg from "../../assets/planet.svg";

interface ParticleCanvasRendererProps {
  containerWidth: number;
  containerHeight: number;
  pixelSize?: number;
}

interface Particle {
  x: number;
  y: number;
  color: string;
  originalX: number;
  originalY: number;
}

export const ParticleCanvasRenderer: React.FC<ParticleCanvasRendererProps> = ({
  containerWidth,
  containerHeight,
  pixelSize = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAndProcessImage = async () => {
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

        // Create temporary canvas for image processing
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) throw new Error("Canvas context not available");

        // Use original SVG dimensions
        tempCanvas.width = 80;
        tempCanvas.height = 50;

        // Disable smoothing for pixel-perfect extraction
        tempCtx.imageSmoothingEnabled = false;
        (tempCtx as any).webkitImageSmoothingEnabled = false;
        (tempCtx as any).mozImageSmoothingEnabled = false;
        (tempCtx as any).msImageSmoothingEnabled = false;
        (tempCtx as any).oImageSmoothingEnabled = false;

        // Draw image at original size
        tempCtx.drawImage(img, 0, 0, 80, 50);

        // Extract pixel data
        const imageData = tempCtx.getImageData(0, 0, 80, 50);
        const data = imageData.data;
        const extractedParticles: Particle[] = [];

        // Process every pixel and create particles
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
                extractedParticles.push({
                  x,
                  y,
                  color: `rgb(${r}, ${g}, ${b})`,
                  originalX: x,
                  originalY: y,
                });
              }
            }
          }
        }

        console.log(
          `Extracted ${extractedParticles.length} particles from 80x50 SVG`
        );
        setParticles(extractedParticles);
      } catch (error) {
        console.error("Error loading particles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndProcessImage();
  }, []);

  useEffect(() => {
    if (isLoading || particles.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;

    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);

    // Set CSS size
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Disable all smoothing
    ctx.imageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;
    (ctx as any).oImageSmoothingEnabled = false;

    // Calculate scaling factors
    const scaleX = containerWidth / 80;
    const scaleY = containerHeight / 50;

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Draw each particle as a filled rectangle
    particles.forEach((particle) => {
      ctx.fillStyle = particle.color;

      // Calculate position with scaling
      const drawX = Math.floor(particle.x * scaleX);
      const drawY = Math.floor(particle.y * scaleY);
      const drawWidth = Math.ceil(scaleX * pixelSize);
      const drawHeight = Math.ceil(scaleY * pixelSize);

      // Draw pixel as filled rectangle
      ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    });
  }, [particles, isLoading, containerWidth, containerHeight, pixelSize]);

  if (isLoading) {
    return <div>Loading particles...</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        // Pixel-perfect rendering settings
        imageRendering: "pixelated",
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,

        // Hardware acceleration
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",

        // Ensure crisp edges
        shapeRendering: "crispEdges" as any,
        textRendering: "geometricPrecision" as any,

        display: "block",
        border: "none",
        outline: "none",
        margin: 0,
        padding: 0,
      }}
    />
  );
};

import React, { useState, useEffect } from "react";

interface SimpleTestRendererProps {
  containerWidth: number;
  containerHeight: number;
}

export const SimpleTestRenderer: React.FC<SimpleTestRendererProps> = ({
  containerWidth,
  containerHeight,
}) => {
  const [visiblePixels, setVisiblePixels] = useState<number>(0);

  useEffect(() => {
    console.log("SimpleTestRenderer: Starting animation");

    // Simple animation: show 10 pixels every 100ms
    const interval = setInterval(() => {
      setVisiblePixels((prev) => {
        const next = prev + 10;
        console.log("SimpleTestRenderer: Showing", next, "pixels");

        if (next >= 100) {
          clearInterval(interval);
          console.log("SimpleTestRenderer: Animation complete");
          return 100;
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Create simple test pixels
  const pixels = [];
  for (let i = 0; i < visiblePixels; i++) {
    const x = (i % 10) * 8; // 10 pixels per row
    const y = Math.floor(i / 10) * 8; // 8px spacing

    pixels.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          width: "6px",
          height: "6px",
          backgroundColor: `hsl(${(i * 36) % 360}, 70%, 50%)`,
          border: "1px solid #000",
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        border: "2px solid #ff0000", // Red border to see the container
        backgroundColor: "#f0f0f0",
      }}
    >
      <div style={{ fontSize: "10px", color: "#000" }}>
        Test: {visiblePixels}/100 pixels
      </div>
      {pixels}
    </div>
  );
};


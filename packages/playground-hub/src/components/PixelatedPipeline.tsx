import React, { useEffect, useState } from "react";
import "./PixelatedPipeline.css";

interface PixelatedPipelineProps {
  className?: string;
}

const PixelatedPipeline: React.FC<PixelatedPipelineProps> = ({ className }) => {
  // 파이프라인 경로를 따라 물이 흐르는 애니메이션을 위한 간단한 구현
  return (
    <div className={`pixelated-pipeline ${className || ""}`}>
      <div className="water-flow-container">
        {/* 여러 개의 물방울 요소 생성 */}
        {Array.from({ length: 50 }).map((_, index) => (
          <div
            key={index}
            className="water-pixel"
            style={{
              animationDelay: `${index * 0.1}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelatedPipeline;

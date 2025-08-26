import React, { useState, useEffect, useCallback } from "react";
import planetSvg from "../../assets/planet.svg";
import { PixelAnimation } from "./PixelAnimation";
import { usePixelAnimation } from "../../hooks/usePixelAnimation";

export const LoadingModal: React.FC = () => {
  // Internal state management
  const [isOpen] = useState(true);
  const [loadingStage, setLoadingStage] = useState(6);
  const [message] = useState("Please, wait");

  // Auto-progression for testing (in actual use, controlled externally)
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStage((prev) => {
        if (prev < 5) {
          return prev + 1;
        } else {
          clearInterval(timer);
          return prev; // Stay at stage 5 (complete) to keep image visible
        }
      });
    }, 4000); // Move to next stage every 4 seconds (doubled for half speed)

    return () => clearInterval(timer);
  }, []);

  const handleComplete = useCallback(() => {
    console.log("Pixel animation completed!");
    // Post-completion processing logic
  }, []);

  const [showPixelAnimation, setShowPixelAnimation] = useState(false);

  const {
    visiblePixels,
    isLoading: pixelDataLoading,
    error: pixelError,
  } = usePixelAnimation({
    svgUrl: planetSvg,
    loadingStage,
    onComplete: handleComplete,
  });

  // Start animation when pixel data is loaded
  useEffect(() => {
    if (!pixelDataLoading && !pixelError && loadingStage > 0) {
      setShowPixelAnimation(true);
    }
  }, [pixelDataLoading, pixelError, loadingStage]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      {/* Main modal content with borders */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#BDBDBD",
          width: "400px",
          border: "1px solid",
          borderTopColor: "#DFDFDF",
          borderLeftColor: "#DFDFDF",
          borderRightColor: "#5F5F5F",
          borderBottomColor: "#5F5F5F",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "23px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "0px 8px 2px",
              width: "100%",
              height: "22px",
              backgroundColor: "#0F2058",
            }}
          >
            <h2
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "1.3",
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              Loading
            </h2>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "16px 8px",
            height: "151px",
            position: "relative",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "8px",
              width: "2px",
              height: "2px",
              backgroundColor: "#D9D9D9",
            }}
          ></div>

          {/* Planet Animation Area */}
          <div
            style={{
              position: "absolute",
              top: "49px", // 16px + 33px
              right: "21px", // 8px + 299px from left = 307px, so right = 400-307-80 = 13px + 8px padding
              width: "76px", // Original size
              height: "48px", // Original size
            }}
          >
            {showPixelAnimation ? (
              <PixelAnimation
                pixels={visiblePixels}
                containerWidth={76}
                containerHeight={48}
                pixelSize={2}
                showTrail={true}
              />
            ) : (
              // Show original image while pixel data is loading or animation is waiting
              <img
                src={planetSvg}
                alt="Planet"
                style={{
                  width: "76px",
                  height: "48px",
                  opacity: loadingStage === 0 ? 1 : 0.3, // Dim before animation starts
                  imageRendering: "pixelated",
                  backgroundColor: "#BDBDBD", // 모달 배경색과 동일
                }}
              />
            )}
          </div>

          {/* Message text */}
          <div
            style={{
              position: "absolute",
              bottom: "21px", // 16px + 5px from bottom of text area
              left: "16px", // 8px + 8px
              width: "101px",
              height: "23px",
            }}
          >
            <p
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "1.64",
                color: "#222222",
                margin: 0,
                position: "absolute",
                top: "5px",
              }}
            >
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

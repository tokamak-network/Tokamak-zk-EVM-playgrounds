import React, { useMemo } from "react";
import { OriginalAnimatedRenderer } from "./modals/OriginalAnimatedRenderer";
import { usePlaygroundStage } from "../hooks/usePlaygroundStage";
import { useAtom } from "jotai";
import { loadingStageAtom } from "../atoms/ui";

export default function LoadingSpinner() {
  // Atom state management for loading stage
  const [loadingStage] = useAtom(loadingStageAtom);
  const { playgroundStageInProcess } = usePlaygroundStage();

  const message = useMemo(() => {
    if (loadingStage === 0) return "Collecting stardust";
    if (loadingStage === 1) return "Aligning tiny particles";
    if (loadingStage === 2) return "Taking shape, looks like a planet";
    if (loadingStage === 3) return "Adding the final sparkles";
    if (loadingStage === 4) return "Almost there, hang tight";
    return undefined;
  }, [loadingStage]);

  // Only show when playground is in process
  if (!playgroundStageInProcess) return null;

  return (
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
          height: "115px",
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
            right: "8px", // Right padding
            width: "384px", // Extended animation area
            height: "48px", // Original resolution container

            // Pixel perfect rendering enhancement
            imageRendering: "pixelated",

            // Disable browser smoothing completely
            WebkitFontSmoothing:
              "none" as React.CSSProperties["WebkitFontSmoothing"],
            MozOsxFontSmoothing:
              "unset" as React.CSSProperties["MozOsxFontSmoothing"],
            fontSmooth: "never" as React.CSSProperties["fontSmooth"],

            // Hardware acceleration and sharpness
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          <>
            <OriginalAnimatedRenderer
              containerWidth={76}
              containerHeight={48}
              loadingStage={loadingStage}
            />
          </>
        </div>

        {/* Message text */}
        <div
          style={{
            position: "absolute",
            bottom: "21px", // 16px + 5px from bottom of text area
            left: "16px", // 8px + 8px
            width: "100%",
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
  );
}

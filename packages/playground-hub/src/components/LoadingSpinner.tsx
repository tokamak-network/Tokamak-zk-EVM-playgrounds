import React, { useState } from "react";
import { OriginalAnimatedRenderer } from "./modals/OriginalAnimatedRenderer";
import { usePlaygroundStage } from "../hooks/usePlaygroundStage";
import { useAtom } from "jotai";
import { loadingStageAtom } from "../atoms/ui";

export default function LoadingSpinner() {
  // Atom state management for loading stage
  const [loadingStage, setLoadingStage] = useAtom(loadingStageAtom);
  const [message] = useState("Please, wait");
  const { playgroundStageInProcess } = usePlaygroundStage();

  // Debug logs
  console.log("LoadingSpinner - loadingStage:", loadingStage);

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
            {/* Animation stage control panel */}
            <div
              style={{
                position: "absolute",
                top: "-30px",
                left: "0",
                display: "flex",
                gap: "5px",
                fontSize: "10px",
              }}
            >
              <button
                onClick={() => setLoadingStage(0)}
                style={{
                  backgroundColor: loadingStage === 0 ? "#007acc" : "#666",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                S0
              </button>
              <button
                onClick={() => setLoadingStage(1)}
                style={{
                  backgroundColor: loadingStage === 1 ? "#007acc" : "#666",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                S1
              </button>
              <button
                onClick={() => setLoadingStage(2)}
                style={{
                  backgroundColor: loadingStage === 2 ? "#007acc" : "#666",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                S2
              </button>
              <button
                onClick={() => setLoadingStage(3)}
                style={{
                  backgroundColor: loadingStage === 3 ? "#007acc" : "#666",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                S3
              </button>
              <button
                onClick={() => setLoadingStage(4)}
                style={{
                  backgroundColor: loadingStage === 4 ? "#007acc" : "#666",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                S4
              </button>
              <button
                onClick={() => setLoadingStage(5)}
                style={{
                  backgroundColor: loadingStage === 5 ? "#007acc" : "#666",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                S5
              </button>
            </div>

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
  );
}

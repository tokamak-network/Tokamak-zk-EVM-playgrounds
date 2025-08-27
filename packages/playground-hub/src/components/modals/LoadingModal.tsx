import React, { useState, useEffect, useCallback } from "react";
import planetSvg from "../../assets/planet.svg";
import { CanvasPixelRenderer } from "./CanvasPixelRenderer";
import { ImageDataPixelRenderer } from "./ImageDataPixelRenderer";
import { GridPixelRenderer } from "./GridPixelRenderer";
import { SVGPixelRenderer } from "./SVGPixelRenderer";
import { CodePenStyleRenderer } from "./CodePenStyleRenderer";
import { PixelPerfectRenderer } from "./PixelPerfectRenderer";
import { TrueNativeRenderer } from "./TrueNativeRenderer";
import { ParticleCanvasRenderer } from "./ParticleCanvasRenderer";
import { CSSPixelatedRenderer } from "./CSSPixelatedRenderer";
import { SimplePixelRenderer } from "./SimplePixelRenderer";
import { SimpleTestRenderer } from "./SimpleTestRenderer";
import { SafeAnimationRenderer } from "./SafeAnimationRenderer";
import { ImprovedCodePenRenderer } from "./ImprovedCodePenRenderer";
import { AnimatedCodePenRenderer } from "./AnimatedCodePenRenderer";
import { OriginalAnimatedRenderer } from "./OriginalAnimatedRenderer";
import { usePixelAnimation } from "../../hooks/usePixelAnimation";

export const LoadingModal: React.FC = () => {
  // Internal state management
  const [isOpen] = useState(true);
  const [loadingStage, setLoadingStage] = useState(3); // 애니메이션 시작
  const [message] = useState("Please, wait");

  // 렌더러 테스트용 상태
  const [rendererType, setRendererType] = useState<
    | "canvas"
    | "imagedata"
    | "grid"
    | "svg"
    | "codepen"
    | "original"
    | "perfect"
    | "native"
    | "truenative"
    | "particle"
    | "csspixel"
    | "simple"
    | "test"
    | "safe"
    | "improved"
    | "animated"
    | "original-animated"
  >("safe");

  // 애니메이션 자동 진행 - 임시 비활성화 (수동 테스트용)
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setLoadingStage((prev) => {
  //       if (prev < 5) {
  //         return prev + 1;
  //       } else {
  //         clearInterval(timer);
  //         return prev; // Stay at stage 5 (complete) to keep image visible
  //       }
  //     });
  //   }, 4000); // Move to next stage every 4 seconds (doubled for half speed)

  //   return () => clearInterval(timer);
  // }, []);

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

  // 디버깅용 로그
  console.log("LoadingModal - visiblePixels count:", visiblePixels.length);
  console.log("LoadingModal - loadingStage:", loadingStage);
  console.log("LoadingModal - pixelDataLoading:", pixelDataLoading);
  console.log("LoadingModal - pixelError:", pixelError);

  // Start animation when pixel data is loaded
  useEffect(() => {
    if (!pixelDataLoading && !pixelError && loadingStage >= 0) {
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
              width: "76px", // Original resolution container
              height: "48px", // Original resolution container

              // 픽셀 퍼펙트 렌더링 강화
              imageRendering: "pixelated",

              // 브라우저 스무딩 완전 비활성화
              WebkitFontSmoothing: "none" as any,
              MozOsxFontSmoothing: "unset" as any,
              fontSmooth: "never" as any,

              // 하드웨어 가속 및 선명도
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            {showPixelAnimation ? (
              <>
                {/* 렌더러 선택 버튼들 */}
                <div
                  style={{
                    position: "absolute",
                    top: "-80px",
                    left: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "10px",
                  }}
                >
                  {/* 첫 번째 줄 - 원본/기본 렌더러들 */}
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={() => setRendererType("original")}
                      style={{
                        backgroundColor:
                          rendererType === "original" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setRendererType("native")}
                      style={{
                        backgroundColor:
                          rendererType === "native" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Native
                    </button>
                    <button
                      onClick={() => setRendererType("truenative")}
                      style={{
                        backgroundColor:
                          rendererType === "truenative" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      True
                    </button>
                    <button
                      onClick={() => setRendererType("simple")}
                      style={{
                        backgroundColor:
                          rendererType === "simple" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Simple
                    </button>
                    <button
                      onClick={() => setRendererType("test")}
                      style={{
                        backgroundColor:
                          rendererType === "test" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Test
                    </button>
                    <button
                      onClick={() => setRendererType("safe")}
                      style={{
                        backgroundColor:
                          rendererType === "safe" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Safe
                    </button>
                    <button
                      onClick={() => setRendererType("csspixel")}
                      style={{
                        backgroundColor:
                          rendererType === "csspixel" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      CSS
                    </button>
                  </div>

                  {/* 두 번째 줄 - 고급 렌더러들 */}
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={() => setRendererType("particle")}
                      style={{
                        backgroundColor:
                          rendererType === "particle" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Particle
                    </button>
                    <button
                      onClick={() => setRendererType("perfect")}
                      style={{
                        backgroundColor:
                          rendererType === "perfect" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Perfect
                    </button>
                    <button
                      onClick={() => setRendererType("codepen")}
                      style={{
                        backgroundColor:
                          rendererType === "codepen" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      CodePen
                    </button>
                    <button
                      onClick={() => setRendererType("improved")}
                      style={{
                        backgroundColor:
                          rendererType === "improved" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Improved
                    </button>
                    <button
                      onClick={() => setRendererType("animated")}
                      style={{
                        backgroundColor:
                          rendererType === "animated" ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Animated
                    </button>
                    <button
                      onClick={() => setRendererType("original-animated")}
                      style={{
                        backgroundColor:
                          rendererType === "original-animated"
                            ? "#007acc"
                            : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      True+Anim
                    </button>
                  </div>

                  {/* 세 번째 줄 - 애니메이션 제어 */}
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={() => setLoadingStage(0)}
                      style={{
                        backgroundColor:
                          loadingStage === 0 ? "#007acc" : "#666",
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
                        backgroundColor:
                          loadingStage === 1 ? "#007acc" : "#666",
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
                        backgroundColor:
                          loadingStage === 2 ? "#007acc" : "#666",
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
                        backgroundColor:
                          loadingStage === 3 ? "#007acc" : "#666",
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
                        backgroundColor:
                          loadingStage === 4 ? "#007acc" : "#666",
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
                        backgroundColor:
                          loadingStage === 5 ? "#007acc" : "#666",
                        color: "white",
                        border: "none",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      S5
                    </button>
                  </div>
                </div>

                {/* 선택된 렌더러 */}
                {rendererType === "canvas" && (
                  <CanvasPixelRenderer
                    pixels={visiblePixels}
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={2}
                  />
                )}
                {rendererType === "imagedata" && (
                  <ImageDataPixelRenderer
                    pixels={visiblePixels}
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={2}
                  />
                )}
                {rendererType === "grid" && (
                  <GridPixelRenderer
                    pixels={visiblePixels}
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={2}
                  />
                )}
                {rendererType === "svg" && (
                  <SVGPixelRenderer
                    pixels={visiblePixels}
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={2}
                  />
                )}
                {rendererType === "codepen" && (
                  <CodePenStyleRenderer
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={2}
                  />
                )}
                {rendererType === "original" && (
                  <img
                    src={planetSvg}
                    alt="Original Planet"
                    style={{
                      width: "76px",
                      height: "48px",
                      // 원본 SVG의 선명도를 최대한 유지
                      imageRendering: "pixelated",

                      // 브라우저 스무딩 비활성화
                      WebkitFontSmoothing: "none" as any,
                      MozOsxFontSmoothing: "unset" as any,
                      fontSmooth: "never" as any,

                      // 하드웨어 가속
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      willChange: "transform",

                      display: "block",
                      border: "none",
                      outline: "none",
                    }}
                  />
                )}
                {rendererType === "perfect" && (
                  <PixelPerfectRenderer
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={1}
                  />
                )}
                {rendererType === "native" && (
                  <img
                    src={planetSvg}
                    alt="Native Size Planet"
                    style={{
                      width: "80px", // SVG 원본 크기
                      height: "50px", // SVG 원본 크기
                      // 스케일링 없이 원본 크기로 표시
                      imageRendering: "pixelated",

                      // 브라우저 스무딩 완전 비활성화
                      WebkitFontSmoothing: "none" as any,
                      MozOsxFontSmoothing: "unset" as any,
                      fontSmooth: "never" as any,

                      // 하드웨어 가속
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      willChange: "transform",

                      display: "block",
                      border: "none",
                      outline: "none",
                    }}
                  />
                )}
                {rendererType === "truenative" && <TrueNativeRenderer />}
                {rendererType === "particle" && (
                  <ParticleCanvasRenderer
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={1}
                  />
                )}
                {rendererType === "csspixel" && (
                  <CSSPixelatedRenderer
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={4}
                  />
                )}
                {rendererType === "simple" && (
                  <SimplePixelRenderer
                    containerWidth={76}
                    containerHeight={48}
                  />
                )}
                {rendererType === "test" && (
                  <SimpleTestRenderer
                    containerWidth={76}
                    containerHeight={48}
                  />
                )}
                {rendererType === "safe" && (
                  <SafeAnimationRenderer
                    containerWidth={76}
                    containerHeight={48}
                    loadingStage={loadingStage}
                  />
                )}
                {rendererType === "improved" && (
                  <ImprovedCodePenRenderer
                    containerWidth={76}
                    containerHeight={48}
                    loadingStage={loadingStage}
                  />
                )}
                {rendererType === "animated" && (
                  <AnimatedCodePenRenderer
                    containerWidth={76}
                    containerHeight={48}
                    pixelSize={2}
                    loadingStage={loadingStage}
                  />
                )}
                {rendererType === "original-animated" && (
                  <OriginalAnimatedRenderer
                    containerWidth={76}
                    containerHeight={48}
                    loadingStage={loadingStage}
                  />
                )}
              </>
            ) : (
              // Show original image while pixel data is loading or animation is waiting
              <img
                src={planetSvg}
                alt="Planet"
                style={{
                  width: "76px",
                  height: "48px",
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

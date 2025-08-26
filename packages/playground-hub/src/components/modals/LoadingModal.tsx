import React from "react";
import planetSvg from "../../assets/planet.svg";

export const LoadingModal: React.FC = () => {
  const isOpen = true;
  const message = "Please, wait";
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

          {/* Planet image */}
          <img
            src={planetSvg}
            alt="Planet"
            style={{
              position: "absolute",
              top: "49px", // 16px + 33px
              right: "21px", // 8px + 299px from left = 307px, so right = 400-307-80 = 13px + 8px padding
              width: "80px",
              height: "50px",
            }}
          />

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

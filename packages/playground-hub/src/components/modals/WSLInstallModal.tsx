import React from "react";

interface WSLInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export const WSLInstallModal: React.FC<WSLInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
}) => {
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
              Install WSL to get started
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
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <p
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "1.64",
                letterSpacing: "-0.02em",
                color: "#222222",
                margin: 0,
              }}
            >
              This app needs WSL to run on Windows.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <button
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "2px 4px",
                  background: "#BDBDBD",
                  border: "1px solid",
                  borderTopColor: "#A8A8A8",
                  borderLeftColor: "#A8A8A8",
                  borderRightColor: "#5F5F5F",
                  borderBottomColor: "#5F5F5F",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={onInstall}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#CACACA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#BDBDBD";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = "#ADADAD";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = "#CACACA";
                }}
              >
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 400,
                    fontSize: "13px",
                    lineHeight: "1.3",
                    color: "#222222",
                  }}
                >
                  Install WSL
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

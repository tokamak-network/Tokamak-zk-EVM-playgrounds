import React, { useState, useEffect } from "react";
import { useWSL } from "../../hooks/useWSL";

export const WSLInstallModal: React.FC = () => {
  const { wslInfo, isLoading } = useWSL();
  const [isOpen, setIsOpen] = useState(false);

  console.log('wslInfo', wslInfo)

  // Determine if modal should be shown
  useEffect(() => {
    console.log("🎭 WSLInstallModal: Modal visibility check", {
      isLoading,
      wslInfo,
      currentModalState: isOpen
    });

    // Don't show modal while still loading WSL info
    if (isLoading) {
      console.log("🎭 WSLInstallModal: Still loading, hiding modal");
      setIsOpen(false);
      return;
    }

    // Show modal only if:
    // 1. WSL info is available
    // 2. WSL is not available (not installed or not working)
    // 3. We're on Windows (implied by wslInfo being available and platform check)
    if (wslInfo) {
      if (!wslInfo.isAvailable) {
        console.log("🎭 WSLInstallModal: WSL not available, showing modal");
        setIsOpen(true);
      } else {
        console.log("🎭 WSLInstallModal: WSL is available, hiding modal");
        setIsOpen(false);
      }
    } else {
      console.log("🎭 WSLInstallModal: No WSL info available, hiding modal");
      setIsOpen(false);
    }
  }, [wslInfo, isLoading]);

  // Handle WSL installation
  const handleInstall = async () => {
    try {
      // For now, provide manual installation instructions
      // In the future, this could be enhanced with automatic installation
      const instructions = `To install WSL, please follow these steps:

1. Open PowerShell as Administrator
2. Run: wsl --install
3. Restart your computer when prompted
4. Set up your Linux username and password

Alternatively, you can install WSL from the Microsoft Store.

The app will automatically detect WSL once it's installed.`;

      alert(instructions);
      
      // Optionally, you could open the Microsoft Store WSL page
      // if (typeof window !== "undefined" && window.shell?.openExternal) {
      //   window.shell.openExternal("ms-windows-store://pdp/?ProductId=9P9TQF7MRM4R");
      // }
    } catch (err) {
      console.error("Failed to show WSL installation instructions:", err);
    }
  };

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
              {wslInfo && !wslInfo.wsl.isAvailable && (
                <>
                  <br />
                  <span style={{ fontSize: "12px", color: "#666666" }}>
                    WSL is not installed or not working properly.
                  </span>
                </>
              )}
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
                onClick={handleInstall}
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

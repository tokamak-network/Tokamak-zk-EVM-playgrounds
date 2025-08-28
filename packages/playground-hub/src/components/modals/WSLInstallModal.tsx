import React, { useState, useEffect } from "react";
import { useWSL } from "../../hooks/useWSL";

export const WSLInstallModal: React.FC = () => {
  const { wslInfo, isLoading, isWindows } = useWSL();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingWSL, setIsCheckingWSL] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Determine if modal should be shown
  useEffect(() => {
    console.log("🎭 WSLInstallModal: Modal visibility check", {
      isLoading,
      wslInfo,
      isWindows,
      currentModalState: isOpen,
    });

    // Don't show modal while still loading WSL info
    if (isLoading) {
      console.log("🎭 WSLInstallModal: Still loading, hiding modal");
      setIsOpen(false);
      return;
    }

    // Only show modal on Windows platform
    if (isWindows === false) {
      console.log("🎭 WSLInstallModal: Not on Windows, hiding modal");
      setIsOpen(false);
      return;
    }

    // Show modal only if:
    // 1. We're on Windows platform (isWindows === true)
    // 2. WSL info is available
    // 3. WSL is not available (not installed or not working)
    if (isWindows === true && wslInfo) {
      if (!wslInfo.isAvailable) {
        console.log(
          "🎭 WSLInstallModal: WSL not available on Windows, showing modal"
        );
        setIsOpen(true);
      } else {
        console.log(
          "🎭 WSLInstallModal: WSL is available on Windows, hiding modal"
        );
        setIsOpen(false);
      }
    } else {
      console.log(
        "🎭 WSLInstallModal: No WSL info available or not Windows, hiding modal"
      );
      setIsOpen(false);
    }
  }, [wslInfo, isLoading, isWindows]);

  // Periodically check WSL status after installation attempt
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Start checking WSL status if modal is open, we're on Windows, and WSL is not available
    if (
      isOpen &&
      isWindows === true &&
      wslInfo &&
      !wslInfo.isAvailable &&
      !isLoading
    ) {
      console.log("🔄 Starting periodic WSL status check...");

      intervalId = setInterval(async () => {
        try {
          setIsCheckingWSL(true);
          console.log("🔍 Checking WSL status...");

          // Check WSL status using the API
          if (typeof window !== "undefined" && window.wslAPI?.checkWSLSupport) {
            const currentWSLStatus = await window.wslAPI.checkWSLSupport();
            console.log("🔍 Current WSL status:", currentWSLStatus);

            // If WSL is now available, the useWSL hook will update and modal will close
            if (currentWSLStatus.isAvailable) {
              console.log("✅ WSL detected! Modal will close automatically.");
              if (intervalId) {
                clearInterval(intervalId);
              }
            }
          }
        } catch (error) {
          console.error("❌ Error checking WSL status:", error);
        } finally {
          setIsCheckingWSL(false);
        }
      }, 5000); // Check every 5 seconds
    }

    // Cleanup interval on unmount or when modal closes
    return () => {
      if (intervalId) {
        console.log("🛑 Stopping WSL status check");
        clearInterval(intervalId);
      }
    };
  }, [isOpen, wslInfo, isLoading, isWindows]);

  // Handle WSL installation
  const handleInstall = async () => {
    try {
      console.log("🔗 Opening Microsoft Store WSL page...");

      // Open Microsoft Store WSL page
      if (typeof window !== "undefined" && window.electron?.openExternalUrl) {
        const wslStoreUrl =
          "https://apps.microsoft.com/detail/9PDXGNCFSCZV?hl=neutral&gl=KR&ocid=pdpshare";
        const result = await window.electron.openExternalUrl(wslStoreUrl);

        if (result.success) {
          console.log("✅ Successfully opened WSL installation page");
          setShowInstructions(true);
        } else {
          console.error(
            "❌ Failed to open WSL installation page:",
            result.error
          );
          // Fallback to manual instructions
          showManualInstructions();
        }
      } else {
        console.warn(
          "⚠️ External URL API not available, showing manual instructions"
        );
        showManualInstructions();
      }
    } catch (err) {
      console.error("❌ Failed to handle WSL installation:", err);
      showManualInstructions();
    }
  };

  // Fallback manual instructions
  const showManualInstructions = () => {
    const instructions = `To install WSL, please click the "Install" button below to open Microsoft Store, or visit our detailed setup guide:

https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/blob/main/packages/playground-hub/WSL_SETUP.md

This dialog will remain open and automatically close when WSL is detected.`;

    alert(instructions);
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
                </>
              )}
              {isCheckingWSL && (
                <>
                  <br />
                  <span style={{ fontSize: "12px", color: "#0066CC" }}>
                    🔍 Checking for WSL installation...
                  </span>
                </>
              )}
              {showInstructions && (
                <>
                  <br />
                  <span style={{ fontSize: "12px", color: "#666666" }}>
                    Microsoft Store is opening to install WSL.
                  </span>
                  <br />
                  <br />
                  <span style={{ fontSize: "12px", color: "#222222" }}>
                    For detailed setup guide:{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.electron?.openExternalUrl(
                          "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/blob/main/packages/playground-hub/WSL_SETUP.md"
                        );
                      }}
                      style={{
                        color: "#0066CC",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Click here for setup guide
                    </a>
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

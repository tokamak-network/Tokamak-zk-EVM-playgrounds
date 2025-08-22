import { useState, useEffect } from "react";

export interface WSLInfo {
  isAvailable: boolean;
  wsl: {
    isAvailable: boolean;
    version?: string;
    error?: string;
  };
  distribution: {
    isAvailable: boolean;
    distribution?: string;
    error?: string;
  };
}

export const useWSL = () => {
  const [wslInfo, setWslInfo] = useState<WSLInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkWSLSupport = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we're on Windows first
        if (typeof window !== "undefined" && window.wslAPI?.checkWSLSupport) {
          // Use dedicated WSL API if available
          console.log("🔍 useWSL: Using dedicated WSL API");
          const wslSupport = await window.wslAPI.checkWSLSupport();
          console.log("🔍 useWSL: WSL support result:", wslSupport);
          setWslInfo(wslSupport);
        } else if (
          typeof window !== "undefined" &&
          window.env?.getEnvironmentInfo
        ) {
          // Fallback to environment info
          const envInfo = await window.env.getEnvironmentInfo();

          if (envInfo.platform === "win32" && envInfo.wslInfo) {
            setWslInfo(envInfo.wslInfo);
          } else {
            // Not Windows or no WSL info available
            setWslInfo({
              isAvailable: false,
              wsl: { isAvailable: false, error: "Not Windows platform" },
              distribution: {
                isAvailable: false,
                error: "Not Windows platform",
              },
            });
          }
        } else {
          // Fallback for non-Electron environment
          setWslInfo({
            isAvailable: false,
            wsl: {
              isAvailable: false,
              error: "Environment info not available",
            },
            distribution: {
              isAvailable: false,
              error: "Environment info not available",
            },
          });
        }
      } catch (err) {
        console.error("Failed to check WSL support:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setWslInfo({
          isAvailable: false,
          wsl: { isAvailable: false, error: "Check failed" },
          distribution: { isAvailable: false, error: "Check failed" },
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkWSLSupport();
  }, []);

  const isWSLSupported = wslInfo?.isAvailable ?? false;

  return {
    wslInfo,
    isLoading,
    error,
    isWSLSupported,
  };
};

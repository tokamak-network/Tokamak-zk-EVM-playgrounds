import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useCuda from "./useCuda";

// Import only the type, not the class
import type { BinaryInfo } from "../utils/binaryManager";

// Binary process status interface
export interface BinaryStatus {
  isInstalled: boolean;
  isExecutable: boolean;
  isRunning: boolean;
  isSupported: boolean;
  binaryInfo?: BinaryInfo;
}

// Binary process interface
export interface BinaryProcess {
  pid?: number;
  port?: number;
  startTime?: Date;
  status: "starting" | "running" | "stopping" | "stopped" | "error";
}

// Extend Window interface for binary service
declare global {
  interface Window {
    binaryService: {
      getBinaryInfo: () => Promise<BinaryInfo>;
      startBinary: (args?: string[]) => Promise<BinaryProcess>;
      stopBinary: (pid?: number) => Promise<boolean>;
      getBinaryStatus: () => Promise<BinaryStatus>;
      executeCommand: (command: string[]) => Promise<string>;
      executeCommandWithStreaming: (
        command: string[],
        callback?: (data: { data: string; isError: boolean }) => void
      ) => Promise<string>;
      onStreamData: (
        callback: (data: { data: string; isError: boolean }) => void
      ) => void;
      removeStreamDataListener: () => void;
      executeDirectCommand: (command: string[]) => Promise<string>;
    };
  }
}

// Global state management for binary cleanup
let globalCleanupInProgress = false;
let globalCleanupCompleted = false;

// Development mode reset function
if (typeof window !== "undefined") {
  (
    window as typeof window & { __resetBinaryCleanup?: () => void }
  ).__resetBinaryCleanup = () => {
    globalCleanupInProgress = false;
    globalCleanupCompleted = false;
    console.log("🔄 Global Binary cleanup state reset");
  };
}

export const useBinary = () => {
  // State management
  const [binaryStatus, setBinaryStatus] = useState<BinaryStatus>({
    isInstalled: false,
    isExecutable: false,
    isRunning: false,
    isSupported: false,
  });
  const [currentProcess, setCurrentProcess] = useState<BinaryProcess | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBinaryStatusLoading, setIsBinaryStatusLoading] =
    useState<boolean>(true);

  const { cudaStatus } = useCuda();
  const hasInitialized = useRef(false);

  // 🚀 ULTRA-IMMEDIATE: 훅 호출 즉시 프로세스 정지 (useEffect 대기 없음)
  if (!globalCleanupCompleted && !globalCleanupInProgress) {
    globalCleanupInProgress = true;
    console.log(
      "⚡⚡ ULTRA-IMMEDIATE binary cleanup starting at:",
      new Date().toISOString()
    );

    // 즉시 실행 (await 없이 비동기 실행)
    (async () => {
      try {
        if (window.binaryService?.stopBinary) {
          console.log(
            "🔍 ULTRA-IMMEDIATE: Stopping binary processes at:",
            new Date().toISOString()
          );

          const stopped = await window.binaryService.stopBinary();
          if (stopped) {
            console.log(
              `✅ ULTRA-IMMEDIATE: Binary process stopped at:`,
              new Date().toISOString()
            );
          } else {
            console.log(
              "⚡ ULTRA-IMMEDIATE: No binary process found to stop at:",
              new Date().toISOString()
            );
          }
        }

        globalCleanupCompleted = true;
        console.log(
          "🔒 ULTRA-IMMEDIATE binary cleanup completed at:",
          new Date().toISOString()
        );

        // cleanup 완료 후 상태 강제 업데이트를 위한 이벤트 발생
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("binaryCleanupCompleted"));
        }, 100);
      } catch (err) {
        console.error("ULTRA-IMMEDIATE binary cleanup failed:", err);
      } finally {
        globalCleanupInProgress = false;
      }
    })();
  }

  // Binary 상태 체크
  const verifyBinaryStatus = useCallback(async () => {
    try {
      if (!window.binaryService?.getBinaryStatus) {
        throw new Error("Binary service not available");
      }

      const status = await window.binaryService.getBinaryStatus();
      setBinaryStatus(status);
      return status;
    } catch (err) {
      console.error("Failed to check binary status:", err);
      const errorStatus: BinaryStatus = {
        isInstalled: false,
        isExecutable: false,
        isRunning: false,
        isSupported: false,
      };
      setBinaryStatus(errorStatus);
      return errorStatus;
    }
  }, []);

  // Binary cleanup 완료 이벤트 리스너
  useEffect(() => {
    let isHandlingCleanup = false;

    const handleCleanupCompleted = async () => {
      if (isHandlingCleanup) {
        console.log(
          "🔔 Binary cleanup event already being handled, skipping..."
        );
        return;
      }

      isHandlingCleanup = true;

      try {
        if (window.binaryService?.getBinaryStatus) {
          const updatedStatus = await window.binaryService.getBinaryStatus();
          setBinaryStatus(updatedStatus);

          // 상태 업데이트가 React에 반영될 시간을 충분히 주기
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (err) {
        console.error("❌ Failed to update binary status after cleanup:", err);
      } finally {
        console.log("🏁 Binary cleanup event handling completed");
        isHandlingCleanup = false;
      }
    };

    window.addEventListener("binaryCleanupCompleted", handleCleanupCompleted);
    return () => {
      window.removeEventListener(
        "binaryCleanupCompleted",
        handleCleanupCompleted
      );
    };
  }, []);

  // 초기 로딩 시 Binary 상태 체크 및 주기적 체크
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;
    let isComponentMounted = true;
    let consecutiveSuccessCount = 0;
    let lastStatus: BinaryStatus | null = null;

    const performCheck = async () => {
      if (!isComponentMounted) return;
      try {
        const status = await verifyBinaryStatus();
        if (isComponentMounted) {
          // 상태가 변경되었을 때만 업데이트
          const hasStatusChanged =
            !lastStatus ||
            lastStatus.isInstalled !== status.isInstalled ||
            lastStatus.isExecutable !== status.isExecutable ||
            lastStatus.isRunning !== status.isRunning ||
            lastStatus.isSupported !== status.isSupported;

          if (hasStatusChanged) {
            setBinaryStatus(status);
            lastStatus = status;
            consecutiveSuccessCount = 0;
          } else {
            consecutiveSuccessCount++;
          }

          // Binary cleanup이 완료된 후에만 로딩 상태를 false로 설정
          if (globalCleanupCompleted) {
            setTimeout(() => {
              setIsBinaryStatusLoading(false);
            }, 100);
          } else {
            if (!isBinaryStatusLoading) {
              setIsBinaryStatusLoading(true);
            }
          }

          // 상태가 안정적이면 체크 간격을 늘림
          if (consecutiveSuccessCount >= 3 && checkInterval) {
            clearInterval(checkInterval);
            checkInterval = setInterval(performCheck, 30000); // 30초로 간격 증가
          }
        }
      } catch (err) {
        console.error("Failed to check binary status:", err);
        consecutiveSuccessCount = 0;
      }
    };

    // 초기 체크
    performCheck();

    // 초기에는 10초마다 체크
    checkInterval = setInterval(performCheck, 10000);

    return () => {
      isComponentMounted = false;
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [verifyBinaryStatus, isBinaryStatusLoading]);

  // Start binary process
  const startBinary = useCallback(
    async (args: string[] = []) => {
      // First, verify binary status
      const currentStatus = await verifyBinaryStatus();

      if (!currentStatus.isSupported) {
        setError("Current platform/architecture is not supported.");
        throw new Error("Current platform/architecture is not supported.");
      }

      if (!currentStatus.isInstalled) {
        const installError =
          "Binary not found. Please install the binary first.";
        setError(installError);
        throw new Error(installError);
      }

      if (!currentStatus.isExecutable) {
        const execError = "Binary exists but is not executable.";
        setError(execError);
        throw new Error(execError);
      }

      // Check CUDA support and configure arguments accordingly
      const finalArgs = [...args];

      try {
        console.log("Checking CUDA support for binary execution...");

        if (cudaStatus.isFullySupported) {
          console.log(
            "CUDA support detected. Adding GPU acceleration arguments."
          );
          finalArgs.push("--enable-gpu");
        } else {
          console.log("CUDA not supported or not available:", cudaStatus.error);
          console.log("Running binary without GPU acceleration.");
        }
      } catch (cudaError) {
        console.warn(
          "Failed to check CUDA support, proceeding without GPU:",
          cudaError
        );
      }

      console.log("Binary start arguments:", finalArgs);

      setLoading(true);
      setError(null);
      try {
        if (!window.binaryService?.startBinary) {
          throw new Error("Binary service not available");
        }

        const process = await window.binaryService.startBinary(finalArgs);
        if (process) {
          setCurrentProcess(process);
          // After starting, update status
          await verifyBinaryStatus();
        }
        return process;
      } catch (err) {
        const errorMessage =
          "Failed to start binary process: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [verifyBinaryStatus, cudaStatus]
  );

  // Stop binary process
  const stopBinary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.binaryService?.stopBinary) {
        throw new Error("Binary service not available");
      }

      const result = await window.binaryService.stopBinary(currentProcess?.pid);
      if (result) {
        setCurrentProcess(null);
        await verifyBinaryStatus();
      }
      return result;
    } catch (err) {
      const errorMessage =
        "Failed to stop binary process: " +
        (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentProcess, verifyBinaryStatus]);

  // Execute command
  const executeCommand = useCallback(async (command: string[]) => {
    setLoading(true);
    setError(null);
    try {
      if (!window.binaryService?.executeCommand) {
        throw new Error("Binary service not available");
      }

      const output = await window.binaryService.executeCommand(command);
      return output;
    } catch (err) {
      const errorMessage =
        "Failed to execute command: " +
        (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute command with streaming
  const executeCommandWithStreaming = useCallback(
    async (
      command: string[],
      onData?: (data: string, isError: boolean) => void
    ) => {
      setLoading(true);
      setError(null);

      if (onData && window.binaryService?.onStreamData) {
        window.binaryService.onStreamData(({ data, isError }) => {
          onData(data, isError);
        });
      }

      try {
        if (!window.binaryService?.executeCommandWithStreaming) {
          throw new Error("Binary service not available");
        }

        const output =
          await window.binaryService.executeCommandWithStreaming(command);
        return output;
      } catch (err) {
        const errorMessage =
          "Failed to execute streaming command: " +
          (err instanceof Error ? err.message : String(err));
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
        if (onData && window.binaryService?.removeStreamDataListener) {
          window.binaryService.removeStreamDataListener();
        }
      }
    },
    []
  );

  // Initial data loading
  useEffect(() => {
    const initialLoad = async () => {
      if (hasInitialized.current) {
        return;
      }

      if (globalCleanupCompleted) {
        console.log(
          "⚡ Binary cleanup already completed globally, skipping at:",
          new Date().toISOString()
        );
        hasInitialized.current = true;
        await verifyBinaryStatus();
        return;
      }

      try {
        hasInitialized.current = true;
        globalCleanupInProgress = true;

        // 즉시 실행: Binary 프로세스 정리
        if (window.binaryService?.stopBinary) {
          await window.binaryService.stopBinary();
        }

        await verifyBinaryStatus();

        globalCleanupCompleted = true;
        console.log("🔒 Global binary cleanup marked as completed");
      } catch (err) {
        console.error("Initial binary loading error:", err);
        hasInitialized.current = false;
        globalCleanupInProgress = false;
      } finally {
        globalCleanupInProgress = false;
      }
    };

    initialLoad();
  }, [verifyBinaryStatus]);

  const isBinaryRunning = useMemo(
    () => !!binaryStatus.isRunning,
    [binaryStatus]
  );

  return {
    // State
    binaryStatus,
    currentProcess,
    loading,
    error,
    isBinaryRunning,
    isBinaryStatusLoading,
    // Actions
    startBinary,
    stopBinary,
    executeCommand,
    executeCommandWithStreaming,
    verifyBinaryStatus,
    // State reset
    clearError: () => setError(null),
  };
};

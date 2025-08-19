import { useState, useCallback, useRef, useEffect } from "react";
import {
  BenchmarkSession,
  BenchmarkData,
  ProcessTiming,
  DetailedProveTiming,
  HardwareInfo,
} from "../types/benchmark";
import { getHardwareInfo } from "../utils/hardwareInfo";
import { useCuda } from "./useCuda";
import { useDocker } from "./useDocker";

// 전역 벤치마크 세션 관리
let globalBenchmarkSession: BenchmarkSession | null = null;
let globalSessionStartTime = 0;
let globalInitializationInProgress = false;
let globalInitializationCompleted = false;
let globalDebugLogged = false;

export const useBenchmark = () => {
  const [currentSession, setCurrentSession] = useState<BenchmarkSession | null>(
    globalBenchmarkSession
  );
  const { cudaStatus } = useCuda();
  const { dockerConfig } = useDocker();
  const sessionStartTime = useRef<number>(globalSessionStartTime);

  // 앱 시작 시 자동으로 벤치마킹 세션 초기화 (전역 세션이 없을 때만)
  useEffect(() => {
    if (globalInitializationCompleted) {
      if (!globalDebugLogged) {
        console.log(
          "🔍 Using existing global benchmark session:",
          globalBenchmarkSession?.sessionId
        );
        globalDebugLogged = true;
      }
      setCurrentSession(globalBenchmarkSession);
      sessionStartTime.current = globalSessionStartTime;
      return;
    }

    if (globalInitializationInProgress) {
      if (!globalDebugLogged) {
        console.log(
          "⏳ Global benchmark initialization already in progress, waiting..."
        );
        globalDebugLogged = true;
      }
      return;
    }

    if (!globalDebugLogged) {
      console.log("🚀 Initializing global benchmark session...");
      globalDebugLogged = true;
    }
    globalInitializationInProgress = true;
    initializeBenchmarkSession();
  }, []);

  // Prove 로그에서 상세 타이밍 정보 파싱
  const parseProveLog = useCallback(
    (logData: string): DetailedProveTiming["details"] => {
      const lines = logData.split("\n");
      const details: DetailedProveTiming["details"] = {
        checkPoints: [],
      };

      for (const line of lines) {
        const trimmedLine = line.trim();

        // 체크포인트 수집
        if (trimmedLine.startsWith("Check point:")) {
          details.checkPoints?.push(trimmedLine);
        }

        // 각 단계별 시간 파싱
        if (trimmedLine.includes("Prover init time:")) {
          const match = trimmedLine.match(
            /Prover init time:\s*([\d.]+)\s*seconds/
          );
          if (match) {
            details.proverInitTime = parseFloat(match[1]);
          }
        } else if (trimmedLine.includes("prove0 running time:")) {
          const match = trimmedLine.match(
            /prove0 running time:\s*([\d.]+)\s*seconds/
          );
          if (match) {
            details.prove0Time = parseFloat(match[1]);
          }
        } else if (trimmedLine.includes("prove1 running time:")) {
          const match = trimmedLine.match(
            /prove1 running time:\s*([\d.]+)\s*seconds/
          );
          if (match) {
            details.prove1Time = parseFloat(match[1]);
          }
        } else if (trimmedLine.includes("prove2 running time:")) {
          const match = trimmedLine.match(
            /prove2 running time:\s*([\d.]+)\s*seconds/
          );
          if (match) {
            details.prove2Time = parseFloat(match[1]);
          }
        } else if (trimmedLine.includes("prove3 running time:")) {
          const match = trimmedLine.match(
            /prove3 running time:\s*([\d.]+)\s*seconds/
          );
          if (match) {
            details.prove3Time = parseFloat(match[1]);
          }
        } else if (trimmedLine.includes("prove4 running time:")) {
          const match = trimmedLine.match(
            /prove4 running time:\s*([\d.]+)\s*seconds/
          );
          if (match) {
            details.prove4Time = parseFloat(match[1]);
          }
        } else if (trimmedLine.includes("Total proving time:")) {
          const match = trimmedLine.match(
            /Total proving time:\s*([\d.]+)\s*seconds/
          );
          if (match) {
            details.totalProvingTime = parseFloat(match[1]);
          }
        }
      }

      return details;
    },
    []
  );

  // 새로운 벤치마킹 세션 시작 (전역 세션이 없을 때만)
  const initializeBenchmarkSession = useCallback(async () => {
    if (globalBenchmarkSession) {
      console.log(
        "🔍 Global benchmark session already exists:",
        globalBenchmarkSession.sessionId
      );
      setCurrentSession(globalBenchmarkSession);
      sessionStartTime.current = globalSessionStartTime;
      globalInitializationCompleted = true;
      globalInitializationInProgress = false;
      return globalBenchmarkSession;
    }

    const sessionId = `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    sessionStartTime.current = startTime;
    globalSessionStartTime = startTime;

    console.log(`🔍 Creating new global benchmark session: ${sessionId}`);

    try {
      const hardwareInfo = await getHardwareInfo();
      console.log("📊 Hardware info collected:", hardwareInfo);

      const session: BenchmarkSession = {
        sessionId,
        startTime,
        hardwareInfo,
        processes: {},
        metadata: {
          dockerImage: dockerConfig?.imageName,
          cudaEnabled: cudaStatus.isFullySupported,
        },
      };

      console.log("🔍 Setting global benchmark session:", session);
      globalBenchmarkSession = session;
      setCurrentSession(session);
      globalInitializationCompleted = true;
      globalInitializationInProgress = false;
      console.log("✅ Global benchmark session initialized successfully");

      return session;
    } catch (error) {
      console.error("Failed to initialize benchmark session:", error);

      // 하드웨어 정보 수집 실패 시에도 세션은 시작
      const session: BenchmarkSession = {
        sessionId,
        startTime,
        processes: {},
        metadata: {
          dockerImage: dockerConfig?.imageName,
          cudaEnabled: cudaStatus.isFullySupported,
        },
      };

      console.log("🔍 Setting fallback global benchmark session:", session);
      globalBenchmarkSession = session;
      setCurrentSession(session);
      globalInitializationCompleted = true;
      globalInitializationInProgress = false;
      console.log("✅ Fallback global benchmark session initialized");
      return session;
    }
  }, [dockerConfig?.imageName, cudaStatus.isFullySupported]);

  // 프로세스 시작 시간 기록
  const startProcessTiming = useCallback(
    (processName: "preprocess" | "prove" | "verify") => {
      // 전역 세션을 우선적으로 사용
      const activeSession = globalBenchmarkSession || currentSession;

      if (!activeSession) {
        console.warn(
          `Cannot start timing for ${processName}: No active benchmark session`
        );
        return null;
      }

      const startTime = Date.now();
      console.log(
        `⏱️ Starting ${processName} timing at ${new Date(startTime).toISOString()}`
      );
      console.log(`🔍 Active benchmark session:`, activeSession);

      return startTime;
    },
    [currentSession, globalBenchmarkSession]
  );

  // 프로세스 완료 시간 기록
  const endProcessTiming = useCallback(
    (
      processName: "preprocess" | "prove" | "verify",
      startTime: number,
      success = true,
      error?: string,
      logData?: string // prove 로그 데이터 추가
    ) => {
      // 전역 세션을 우선적으로 사용
      const activeSession = globalBenchmarkSession || currentSession;

      if (!activeSession) {
        console.warn(
          `Cannot end timing for ${processName}: No active benchmark session`
        );
        return;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const timing: ProcessTiming = {
        startTime,
        endTime,
        duration,
        success,
        error,
      };

      console.log(`⏱️ Completed ${processName} timing:`, {
        duration: `${duration}ms`,
        success,
        error,
      });

      setCurrentSession((prev) => {
        if (!prev) return prev;

        console.log(
          `📝 Updating global benchmark session for ${processName}:`,
          {
            previousProcesses: prev.processes,
            newTiming: timing,
          }
        );

        // prove 프로세스인 경우 상세 정보 추가
        if (processName === "prove" && logData) {
          const detailedTiming: DetailedProveTiming = {
            ...timing,
            details: parseProveLog(logData),
          };

          const updatedSession = {
            ...prev,
            processes: {
              ...prev.processes,
              [processName]: detailedTiming,
            },
          };

          console.log(
            `📊 Updated global session with detailed prove timing:`,
            updatedSession
          );

          // 전역 상태 업데이트
          globalBenchmarkSession = updatedSession;
          return updatedSession;
        }

        const updatedSession = {
          ...prev,
          processes: {
            ...prev.processes,
            [processName]: timing,
          },
        };

        console.log(
          `📊 Updated global session with ${processName} timing:`,
          updatedSession
        );

        // 전역 상태 업데이트
        globalBenchmarkSession = updatedSession;
        return updatedSession;
      });

      return timing;
    },
    [currentSession, parseProveLog]
  );

  // 벤치마크 데이터를 JSON으로 생성
  const generateBenchmarkData = useCallback((): BenchmarkData | null => {
    // 전역 세션을 우선적으로 사용
    const activeSession = globalBenchmarkSession || currentSession;

    if (!activeSession) {
      console.warn("Cannot generate benchmark data: No active session");
      return null;
    }

    const totalSessionDuration = activeSession.processes.prove?.endTime
      ? activeSession.processes.prove.endTime - sessionStartTime.current
      : undefined;

    const benchmarkData: BenchmarkData = {
      sessionId: activeSession.sessionId,
      timestamp: new Date().toISOString(),
      hardwareInfo: activeSession.hardwareInfo || {
        cpu: {
          model: "Unknown",
          cores: 0,
          threads: 0,
          architecture: "Unknown",
        },
        memory: { total: 0, available: 0 },
        os: { platform: "Unknown", release: "Unknown", version: "Unknown" },
      },
      processes: activeSession.processes,
      metadata: {
        dockerImage: activeSession.metadata.dockerImage || "unknown",
        cudaEnabled: activeSession.metadata.cudaEnabled,
        totalSessionDuration,
      },
    };

    console.log("📊 Generated benchmark data:", benchmarkData);
    return benchmarkData;
  }, [currentSession]);

  // JSON 파일로 다운로드
  const downloadBenchmarkData = useCallback(() => {
    const data = generateBenchmarkData();
    if (!data) {
      console.error("Cannot download benchmark data: No data available");
      return;
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tokamak_benchmark_${data.sessionId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      console.log("📥 Benchmark data downloaded successfully");
    } catch (error) {
      console.error("Failed to download benchmark data:", error);
    }
  }, [generateBenchmarkData]);

  // 세션 리셋 (전역 상태도 리셋)
  const resetBenchmarkSession = useCallback(() => {
    console.log("🔄 Resetting global benchmark session");
    globalBenchmarkSession = null;
    globalSessionStartTime = 0;
    globalInitializationInProgress = false;
    globalInitializationCompleted = false;
    globalDebugLogged = false;
    setCurrentSession(null);
    sessionStartTime.current = 0;
  }, []);

  // Prove 완료 후 자동 다운로드 체크
  const checkAutoDownload = useCallback(() => {
    const activeSession = globalBenchmarkSession || currentSession;
    if (activeSession?.processes.prove?.success) {
      console.log(
        "✅ Prove process completed successfully, triggering auto-download"
      );
      // 약간의 지연 후 자동 다운로드
      setTimeout(() => {
        downloadBenchmarkData();
      }, 1000);
    }
  }, [currentSession, downloadBenchmarkData, globalBenchmarkSession]);

  return {
    currentSession,
    initializeBenchmarkSession,
    startProcessTiming,
    endProcessTiming,
    generateBenchmarkData,
    downloadBenchmarkData,
    resetBenchmarkSession,
    checkAutoDownload,
    isSessionActive: !!currentSession,
    globalBenchmarkSession,
  };
};

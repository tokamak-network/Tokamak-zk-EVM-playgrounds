import { useState, useCallback, useRef, useEffect } from "react";
import {
  BenchmarkSession,
  BenchmarkData,
  ProcessTiming,
  HardwareInfo,
} from "../types/benchmark";
import { getHardwareInfo } from "../utils/hardwareInfo";
import { useCuda } from "./useCuda";
import { useDocker } from "./useDocker";

export const useBenchmark = () => {
  const [currentSession, setCurrentSession] = useState<BenchmarkSession | null>(
    null
  );
  const { cudaStatus } = useCuda();
  const { dockerConfig } = useDocker();
  const sessionStartTime = useRef<number>(0);

  // 앱 시작 시 자동으로 벤치마킹 세션 초기화
  useEffect(() => {
    initializeBenchmarkSession();
  }, []);

  // 새로운 벤치마킹 세션 시작
  const initializeBenchmarkSession = useCallback(async () => {
    const sessionId = `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    sessionStartTime.current = startTime;

    console.log(`🔍 Starting benchmark session: ${sessionId}`);

    try {
      const hardwareInfo = await getHardwareInfo();

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

      setCurrentSession(session);
      console.log("🔍 Benchmark session initialized:", session);

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

      setCurrentSession(session);
      return session;
    }
  }, [dockerConfig?.imageName, cudaStatus.isFullySupported]);

  // 프로세스 시작 시간 기록
  const startProcessTiming = useCallback(
    (processName: "preprocess" | "prove" | "verify") => {
      if (!currentSession) {
        console.warn(
          `Cannot start timing for ${processName}: No active benchmark session`
        );
        return null;
      }

      const startTime = Date.now();
      console.log(
        `⏱️ Starting ${processName} timing at ${new Date(startTime).toISOString()}`
      );

      return startTime;
    },
    [currentSession]
  );

  // 프로세스 완료 시간 기록
  const endProcessTiming = useCallback(
    (
      processName: "preprocess" | "prove" | "verify",
      startTime: number,
      success: boolean = true,
      error?: string
    ) => {
      if (!currentSession) {
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

        return {
          ...prev,
          processes: {
            ...prev.processes,
            [processName]: timing,
          },
        };
      });

      return timing;
    },
    [currentSession]
  );

  // 벤치마크 데이터를 JSON으로 생성
  const generateBenchmarkData = useCallback((): BenchmarkData | null => {
    if (!currentSession) {
      console.warn("Cannot generate benchmark data: No active session");
      return null;
    }

    const totalSessionDuration = currentSession.processes.prove?.endTime
      ? currentSession.processes.prove.endTime - sessionStartTime.current
      : undefined;

    const benchmarkData: BenchmarkData = {
      sessionId: currentSession.sessionId,
      timestamp: new Date().toISOString(),
      hardwareInfo: currentSession.hardwareInfo || {
        cpu: {
          model: "Unknown",
          cores: 0,
          threads: 0,
          architecture: "Unknown",
        },
        memory: { total: 0, available: 0 },
        os: { platform: "Unknown", release: "Unknown", version: "Unknown" },
      },
      processes: currentSession.processes,
      metadata: {
        ...currentSession.metadata,
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

  // 세션 리셋
  const resetBenchmarkSession = useCallback(() => {
    console.log("🔄 Resetting benchmark session");
    setCurrentSession(null);
    sessionStartTime.current = 0;
  }, []);

  // Prove 완료 후 자동 다운로드 체크
  const checkAutoDownload = useCallback(() => {
    if (currentSession?.processes.prove?.success) {
      console.log(
        "✅ Prove process completed successfully, triggering auto-download"
      );
      // 약간의 지연 후 자동 다운로드
      setTimeout(() => {
        downloadBenchmarkData();
      }, 1000);
    }
  }, [currentSession, downloadBenchmarkData]);

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
  };
};

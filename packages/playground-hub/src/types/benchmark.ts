export interface HardwareInfo {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    architecture: string;
  };
  memory: {
    total: number; // in GB
    available: number; // in GB
  };
  gpu?: {
    name: string;
    memory: number; // in GB
    cudaSupported: boolean;
  };
  os: {
    platform: string;
    release: string;
    version: string;
  };
}

export interface ProcessTiming {
  startTime: number; // timestamp in ms
  endTime: number; // timestamp in ms
  duration: number; // duration in ms
  success: boolean;
  error?: string;
}

// 상세한 prove 타이밍 정보
export interface DetailedProveTiming extends ProcessTiming {
  details?: {
    proverInitTime?: number; // seconds
    prove0Time?: number; // seconds
    prove1Time?: number; // seconds
    prove2Time?: number; // seconds
    prove3Time?: number; // seconds
    prove4Time?: number; // seconds
    totalProvingTime?: number; // seconds
    checkPoints?: string[]; // 로그에서 추출한 체크포인트들
  };
}

export interface BenchmarkData {
  sessionId: string;
  timestamp: string; // ISO string
  hardwareInfo: HardwareInfo;
  processes: {
    preprocess?: ProcessTiming;
    prove?: DetailedProveTiming;
    verify?: ProcessTiming;
  };
  metadata: {
    cudaEnabled: boolean;
    totalSessionDuration?: number; // from start to verify completion
  };
}

export interface BenchmarkSession {
  sessionId: string;
  startTime: number;
  hardwareInfo?: HardwareInfo;
  processes: {
    preprocess?: ProcessTiming;
    prove?: DetailedProveTiming;
    verify?: ProcessTiming;
  };
  metadata: {
    cudaEnabled: boolean;
  };
}

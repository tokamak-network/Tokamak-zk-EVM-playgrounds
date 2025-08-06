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

export interface BenchmarkData {
  sessionId: string;
  timestamp: string; // ISO string
  hardwareInfo: HardwareInfo;
  processes: {
    preprocess?: ProcessTiming;
    prove?: ProcessTiming;
    verify?: ProcessTiming;
  };
  metadata: {
    dockerImage: string;
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
    prove?: ProcessTiming;
    verify?: ProcessTiming;
  };
  metadata: {
    dockerImage?: string;
    cudaEnabled: boolean;
  };
}

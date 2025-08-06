import { HardwareInfo } from "../types/benchmark";

// Electron의 system info API가 있는지 확인
declare global {
  interface Window {
    electronAPI?: {
      getSystemInfo?: () => Promise<any>;
    };
  }
}

export async function getHardwareInfo(): Promise<HardwareInfo> {
  try {
    // Electron API를 통한 시스템 정보 수집 시도
    if (window.electronAPI?.getSystemInfo) {
      const systemInfo = await window.electronAPI.getSystemInfo();
      return systemInfo;
    }

    // 웹 환경에서의 제한적인 정보 수집
    const hardwareInfo: HardwareInfo = {
      cpu: {
        model: getCPUInfo(),
        cores: navigator.hardwareConcurrency || 0,
        threads: navigator.hardwareConcurrency || 0,
        architecture: getArchitecture(),
      },
      memory: {
        total: getMemoryInfo().total,
        available: getMemoryInfo().available,
      },
      os: {
        platform: getPlatform(),
        release: getOSVersion(),
        version: navigator.userAgent,
      },
    };

    // GPU 정보 수집 시도
    const gpuInfo = await getGPUInfo();
    if (gpuInfo) {
      hardwareInfo.gpu = gpuInfo;
    }

    return hardwareInfo;
  } catch (error) {
    console.error("Failed to collect hardware info:", error);

    // 기본값 반환
    return {
      cpu: {
        model: "Unknown",
        cores: navigator.hardwareConcurrency || 0,
        threads: navigator.hardwareConcurrency || 0,
        architecture: "Unknown",
      },
      memory: {
        total: 0,
        available: 0,
      },
      os: {
        platform: getPlatform(),
        release: "Unknown",
        version: navigator.userAgent,
      },
    };
  }
}

function getCPUInfo(): string {
  // 웹에서는 CPU 모델 정보를 직접 얻기 어려움
  // User Agent에서 일부 정보 추출 시도
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Intel")) return "Intel CPU";
  if (userAgent.includes("AMD")) return "AMD CPU";
  if (userAgent.includes("Apple")) return "Apple Silicon";

  return "Unknown CPU";
}

function getArchitecture(): string {
  // 웹에서는 정확한 아키텍처 정보를 얻기 어려움
  if (
    navigator.userAgent.includes("x64") ||
    navigator.userAgent.includes("x86_64")
  ) {
    return "x64";
  }
  if (
    navigator.userAgent.includes("ARM") ||
    navigator.userAgent.includes("arm64")
  ) {
    return "ARM64";
  }
  return "Unknown";
}

function getMemoryInfo(): { total: number; available: number } {
  // 웹에서는 정확한 메모리 정보를 얻기 어려움
  // @ts-ignore - performance.memory는 Chrome에서만 사용 가능
  const memory = (performance as any)?.memory;

  if (memory) {
    return {
      total: Math.round((memory.totalJSHeapSize / (1024 * 1024 * 1024)) * 8), // 추정값
      available: Math.round(memory.totalJSHeapSize / (1024 * 1024 * 1024)), // 추정값
    };
  }

  return { total: 0, available: 0 };
}

function getPlatform(): string {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iOS")) return "iOS";

  return "Unknown";
}

function getOSVersion(): string {
  const userAgent = navigator.userAgent;

  // Windows 버전 추출
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
  if (windowsMatch) {
    const version = windowsMatch[1];
    switch (version) {
      case "10.0":
        return "Windows 10/11";
      case "6.3":
        return "Windows 8.1";
      case "6.2":
        return "Windows 8";
      case "6.1":
        return "Windows 7";
      default:
        return `Windows ${version}`;
    }
  }

  // macOS 버전 추출
  const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
  if (macMatch) {
    return `macOS ${macMatch[1].replace(/_/g, ".")}`;
  }

  return "Unknown";
}

async function getGPUInfo(): Promise<{
  name: string;
  memory: number;
  cudaSupported: boolean;
} | null> {
  try {
    // WebGL을 통한 GPU 정보 수집 시도
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return {
          name: renderer || "Unknown GPU",
          memory: 0, // WebGL에서는 GPU 메모리 정보를 얻기 어려움
          cudaSupported: renderer
            ? renderer.toLowerCase().includes("nvidia")
            : false,
        };
      }
    }

    return null;
  } catch (error) {
    console.warn("Failed to get GPU info:", error);
    return null;
  }
}

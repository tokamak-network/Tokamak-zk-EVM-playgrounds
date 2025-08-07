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
    // Attempt to collect system information via Electron API
    if (window.electronAPI?.getSystemInfo) {
      const systemInfo = await window.electronAPI.getSystemInfo();

      if (systemInfo) {
        // Add GPU information as well
        const gpuInfo = await getGPUInfo();
        return {
          ...systemInfo,
          gpu: gpuInfo || undefined,
        };
      }
    } else {
      console.warn("Electron API not available or getSystemInfo not found"); // Warning log
    }

    // Collect GPU information first to help with CPU/Architecture detection
    const gpuInfo = await getGPUInfo();

    // Limited information collection in web environment
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

    // Add GPU information
    if (gpuInfo) {
      hardwareInfo.gpu = gpuInfo;
    }

    return hardwareInfo;
  } catch (error) {
    console.error("Failed to collect hardware info:", error);

    // Return default values
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
  // Difficult to get CPU model information directly in web environment
  // Attempt to extract some information from User Agent
  const userAgent = navigator.userAgent;

  // Apple Silicon 감지 개선
  // GPU 정보를 통해 Apple Silicon 감지 시도
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer && renderer.includes("Apple M")) {
          // Apple M1, M1 Pro, M1 Max, M2 등 감지
          const match = renderer.match(/Apple (M\d+\s?(?:Pro|Max|Ultra)?)/i);
          return match ? `Apple ${match[1]}` : "Apple Silicon";
        }
      }
    }
  } catch (error) {
    console.warn("Failed to detect GPU for CPU info:", error);
  }

  // User Agent 기반 감지 (fallback)
  if (userAgent.includes("Mac") && !userAgent.includes("Intel Mac OS X")) {
    return "Apple Silicon";
  }

  // Intel Mac 감지 (구형 맥)
  if (userAgent.includes("Intel Mac OS X")) {
    // macOS 버전으로 Apple Silicon 여부 추가 확인
    const macMatch = userAgent.match(/Mac OS X (\d+)[._](\d+)/);
    if (macMatch) {
      const major = parseInt(macMatch[1]);
      const minor = parseInt(macMatch[2]);
      // macOS 11.0 (Big Sur) 이상에서는 Apple Silicon 가능성 높음
      if (major >= 11 || (major === 10 && minor >= 16)) {
        return "Apple Silicon (detected)";
      }
    }
    return "Intel CPU";
  }

  if (userAgent.includes("AMD")) return "AMD CPU";

  return "Unknown CPU";
}

function getArchitecture(): string {
  // 웹에서는 정확한 아키텍처 정보를 얻기 어려움

  // Apple Silicon 감지 개선
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer && renderer.includes("Apple M")) {
          return "ARM64";
        }
      }
    }
  } catch (error) {
    console.warn("Failed to detect GPU for architecture:", error);
  }

  // User Agent 기반 감지
  const userAgent = navigator.userAgent;

  if (userAgent.includes("x64") || userAgent.includes("x86_64")) {
    return "x64";
  }
  if (userAgent.includes("ARM") || userAgent.includes("arm64")) {
    return "ARM64";
  }

  // Mac에서 macOS 11+ 이면 ARM64 가능성 높음
  if (userAgent.includes("Mac")) {
    const macMatch = userAgent.match(/Mac OS X (\d+)[._](\d+)/);
    if (macMatch) {
      const major = parseInt(macMatch[1]);
      const minor = parseInt(macMatch[2]);
      if (major >= 11 || (major === 10 && minor >= 16)) {
        return "ARM64";
      }
    }
    return "x64"; // 구형 Intel Mac
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

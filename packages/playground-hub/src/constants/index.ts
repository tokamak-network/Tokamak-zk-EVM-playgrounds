export const DOCKER_NAME = "tokamak-zk-evm";

// Environment-specific Docker image configurations
export const DOCKER_CONFIGS = {
  "mac-arm": {
    tag: "mac-arm",
    downloadUrl:
      "https://pub-30801471f84a46049e31eea6c3395e00.r2.dev/docker-images/tokamak-zk-evm-mac-arm.tar.gz",
    fileName: "tokamak-zk-evm-mac-arm.tar.gz",
  },
  "windows-cpu": {
    tag: "windows-cpu-setup-completed",
    downloadUrl:
      "https://pub-30801471f84a46049e31eea6c3395e00.r2.dev/docker-images/tokamak-zk-evm-windows-cpu.tar.gz",
    fileName: "tokamak-zk-evm-windows-cpu.tar.gz",
  },
  "windows-gpu": {
    tag: "windows-gpu",
    downloadUrl:
      "https://pub-30801471f84a46049e31eea6c3395e00.r2.dev/docker-images/tokamak-zk-evm-windows-gpu.tar.gz",
    fileName: "tokamak-zk-evm-windows-gpu.tar.gz",
  },
};

// Legacy constants for backward compatibility
export const DOCKER_DOWNLOAD_URL =
  "https://pub-30801471f84a46049e31eea6c3395e00.r2.dev/docker-images/tokamak-zk-evm.tar.gz";
export const FILE_NAME = "tokamak-zk-evm.tar.gz";

// Cache for Docker configuration to prevent repeated API calls
let cachedDockerConfig: {
  tag: string;
  downloadUrl: string;
  fileName: string;
  imageName: string;
} | null = null;

let configLoadPromise: Promise<{
  tag: string;
  downloadUrl: string;
  fileName: string;
  imageName: string;
}> | null = null;

// Function to get appropriate Docker config based on environment
export const getDockerConfigForEnvironment = async (): Promise<{
  tag: string;
  downloadUrl: string;
  fileName: string;
  imageName: string;
}> => {
  // Return cached config if available
  if (cachedDockerConfig) {
    return cachedDockerConfig;
  }

  // Return existing promise if one is already in progress
  if (configLoadPromise) {
    return configLoadPromise;
  }

  // Create new promise for loading config
  configLoadPromise = (async () => {
    try {
      // Get environment info from main process
      const envInfo = await window.env?.getEnvironmentInfo?.();

      if (!envInfo) {
        console.warn("Environment info not available, using default config");
        const defaultConfig = {
          tag: "latest",
          downloadUrl: DOCKER_DOWNLOAD_URL,
          fileName: FILE_NAME,
          imageName: `${DOCKER_NAME}:latest`,
        };
        cachedDockerConfig = defaultConfig;
        return defaultConfig;
      }

      const { platform, hasGpuSupport } = envInfo;

      let configKey: keyof typeof DOCKER_CONFIGS;

      if (platform === "darwin") {
        configKey = "mac-arm";
      } else if (platform === "win32") {
        configKey = hasGpuSupport ? "windows-gpu" : "windows-cpu";
      } else {
        // Linux or other platforms - default to windows-cpu config for now
        configKey = "windows-cpu";
      }

      const config = DOCKER_CONFIGS[configKey];

      const result = {
        tag: config.tag,
        downloadUrl: config.downloadUrl,
        fileName: config.fileName,
        imageName: `${DOCKER_NAME}:${config.tag}`,
      };

      // Cache the result
      cachedDockerConfig = result;
      console.log("✅ Loaded Docker config for environment:", result);

      return result;
    } catch (error) {
      console.error("Failed to get environment info:", error);
      const fallbackConfig = {
        tag: "latest",
        downloadUrl: DOCKER_DOWNLOAD_URL,
        fileName: FILE_NAME,
        imageName: `${DOCKER_NAME}:latest`,
      };
      cachedDockerConfig = fallbackConfig;
      return fallbackConfig;
    } finally {
      // Clear the promise reference once completed
      configLoadPromise = null;
    }
  })();

  return configLoadPromise;
};

// Function to clear cache (useful for testing or when environment changes)
export const clearDockerConfigCache = () => {
  cachedDockerConfig = null;
  configLoadPromise = null;
};

export const getEnvVars = async () => {
  if (window.env) {
    return await window.env.getEnvVars();
  }
};

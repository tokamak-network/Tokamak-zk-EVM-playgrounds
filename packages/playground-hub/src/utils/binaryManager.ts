import { app } from "electron";
import * as path from "path";
import * as fs from "fs";

export interface BinaryInfo {
  name: string;
  path: string;
  platform: string;
  arch: string;
  exists: boolean;
  executable: boolean;
}

export class BinaryManager {
  private binaryName: string;

  constructor(binaryName?: string) {
    // 플랫폼별 바이너리 이름 자동 생성
    if (!binaryName) {
      const platform = process.platform;
      const arch = process.arch;

      if (platform === "darwin") {
        this.binaryName =
          arch === "arm64" ? "synthesizer-mac-arm64" : "synthesizer-mac-x64";
      } else if (platform === "win32") {
        this.binaryName =
          arch === "arm64"
            ? "synthesizer-win-arm64.exe"
            : "synthesizer-win-x64.exe";
      } else if (platform === "linux") {
        this.binaryName =
          arch === "arm64"
            ? "synthesizer-linux-arm64"
            : "synthesizer-linux-x64";
      } else {
        this.binaryName = "synthesizer-unknown";
      }
    } else {
      this.binaryName = binaryName;
    }
  }

  /**
   * Get the platform-specific binary path
   */
  private getBinaryPath(): string {
    const platform = process.platform;
    const arch = process.arch;
    // 바이너리 이름에 이미 확장자가 포함되어 있음
    const binaryFileName = this.binaryName;

    let basePath: string;

    if (app.isPackaged) {
      // Production: app resources folder
      basePath = path.join(process.resourcesPath, "binaries", "synthesizer");
    } else {
      // Development: src/binaries
      // Use app.getAppPath() instead of __dirname for better compatibility
      basePath = path.join(app.getAppPath(), "src", "binaries", "synthesizer");
    }

    return path.join(basePath, binaryFileName);
  }

  /**
   * Get binary information including existence and executability
   */
  async getBinaryInfo(): Promise<BinaryInfo> {
    const binaryPath = this.getBinaryPath();
    const platform = process.platform;
    const arch = process.arch;

    let exists = false;
    let executable = false;

    try {
      const stats = fs.statSync(binaryPath);
      exists = stats.isFile();

      if (exists && platform !== "win32") {
        // Check if file has execute permission (Unix-like systems)
        const mode = stats.mode;
        executable = !!(mode & parseInt("111", 8)); // Check if any execute bit is set
      } else if (exists && platform === "win32") {
        // On Windows, .exe files are generally executable
        executable = binaryPath.endsWith(".exe");
      }
    } catch (error) {
      // File doesn't exist or can't be accessed
      exists = false;
      executable = false;
    }

    return {
      name: this.binaryName,
      path: binaryPath,
      platform,
      arch,
      exists,
      executable,
    };
  }

  /**
   * Ensure binary exists and is executable
   */
  async ensureBinaryExists(): Promise<string> {
    const binaryInfo = await this.getBinaryInfo();

    if (!binaryInfo.exists) {
      throw new Error(`Binary not found at: ${binaryInfo.path}`);
    }

    // Set execute permissions if needed (Unix-like systems)
    if (
      binaryInfo.exists &&
      !binaryInfo.executable &&
      process.platform !== "win32"
    ) {
      try {
        fs.chmodSync(binaryInfo.path, "755");
        console.log(`Set execute permissions for binary: ${binaryInfo.path}`);
      } catch (error) {
        console.warn(`Failed to set execute permissions: ${error}`);
        throw new Error(
          `Binary exists but cannot be made executable: ${binaryInfo.path}`
        );
      }
    }

    return binaryInfo.path;
  }

  /**
   * Get the expected binary directory for manual installation
   */
  getBinaryDirectory(): string {
    const platform = process.platform;
    const arch = process.arch;

    if (app.isPackaged) {
      return path.join(process.resourcesPath, "binaries", "synthesizer");
    } else {
      return path.join(app.getAppPath(), "src", "binaries", "synthesizer");
    }
  }

  /**
   * Validate if the current platform/architecture is supported
   */
  isSupportedPlatform(): boolean {
    const platform = process.platform;
    const arch = process.arch;

    const supportedCombinations = [
      { platform: "darwin", arch: "x64" },
      { platform: "darwin", arch: "arm64" },
      { platform: "win32", arch: "x64" },
      { platform: "win32", arch: "arm64" },
      { platform: "linux", arch: "x64" },
      { platform: "linux", arch: "arm64" },
    ];

    return supportedCombinations.some(
      (combo) => combo.platform === platform && combo.arch === arch
    );
  }
}

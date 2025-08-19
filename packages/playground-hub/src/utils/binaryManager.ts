import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";

export interface BinaryInfo {
  path: string;
  platform: string;
  arch: string;
  exists: boolean;
  executable: boolean;
}

export class BinaryManager {
  private binaryName: string;

  constructor(binaryName?: string) {
    // Auto-generate platform-specific binary names
    if (!binaryName) {
      const platform = process.platform;
      const arch = process.arch;

      if (platform === "darwin") {
        this.binaryName =
          arch === "arm64" ? "synthesizer-final" : "synthesizer-final";
      } else if (platform === "win32") {
        this.binaryName =
          arch === "arm64" ? "synthesizer-final.exe" : "synthesizer-final.exe";
      } else if (platform === "linux") {
        this.binaryName =
          arch === "arm64" ? "synthesizer-final" : "synthesizer-final";
      } else {
        this.binaryName = "synthesizer-final";
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
    let basePath: string;

    if (app.isPackaged) {
      basePath = path.join(process.resourcesPath, "binaries", "synthesizer");
    } else {
      basePath = path.join(app.getAppPath(), "src", "binaries", "synthesizer");
    }

    return path.join(basePath, this.binaryName);
  }

  /**
   * Get the binary directory path
   */
  getBinaryDirectory(): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, "binaries", "synthesizer");
    } else {
      return path.join(app.getAppPath(), "src", "binaries", "synthesizer");
    }
  }

  /**
   * Check if binary exists and is executable
   */
  async getBinaryInfo(): Promise<BinaryInfo> {
    const binaryPath = this.getBinaryPath();
    const exists = fs.existsSync(binaryPath);
    let executable = false;

    if (exists) {
      try {
        const stats = fs.statSync(binaryPath);
        executable = !!(stats.mode & parseInt("111", 8));
      } catch (error) {
        console.error("Error checking binary permissions:", error);
      }
    }

    return {
      path: binaryPath,
      platform: process.platform,
      arch: process.arch,
      exists,
      executable,
    };
  }

  /**
   * Ensure binary exists and is executable
   */
  async ensureBinaryExists(): Promise<void> {
    const info = await this.getBinaryInfo();

    if (!info.exists) {
      throw new Error(`Binary not found: ${info.path}`);
    }

    if (!info.executable) {
      console.log("Setting execute permissions for binary:", info.path);
      try {
        fs.chmodSync(info.path, 0o755);
      } catch (error) {
        console.error("Failed to set execute permissions:", error);
        throw error;
      }
    }

    // On macOS, remove quarantine attribute if present
    if (process.platform === "darwin") {
      await new Promise<void>((resolve) => {
        exec(`xattr -d com.apple.quarantine "${info.path}"`, (error: any) => {
          if (error) {
            console.log(
              "No quarantine attribute to remove or removal failed:",
              error.message
            );
          } else {
            console.log("Quarantine attribute removed from binary");
          }
          resolve();
        });
      });
    }
  }

  /**
   * Get all files in the binary directory
   */
  getBinaryDirectoryContents(): string[] {
    const binaryDir = this.getBinaryDirectory();
    try {
      if (fs.existsSync(binaryDir)) {
        return fs.readdirSync(binaryDir);
      }
    } catch (error) {
      console.error("Error reading binary directory:", error);
    }
    return [];
  }

  /**
   * Get the expected binary name for the current platform
   */
  getExpectedBinaryName(): string {
    return this.binaryName;
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

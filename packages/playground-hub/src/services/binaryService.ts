import { spawn, ChildProcess } from "child_process";
import { BinaryManager, BinaryInfo } from "../utils/binaryManager";
import { BinaryStatus, BinaryProcess } from "../hooks/useBinary";

export class BinaryService {
  private binaryManager: BinaryManager;
  private currentProcess: ChildProcess | null = null;
  private streamCallback:
    | ((data: { data: string; isError: boolean }) => void)
    | null = null;

  constructor() {
    this.binaryManager = new BinaryManager();
  }

  /**
   * Get binary information
   */
  async getBinaryInfo(): Promise<BinaryInfo> {
    return await this.binaryManager.getBinaryInfo();
  }

  /**
   * Get comprehensive binary status
   */
  async getBinaryStatus(): Promise<BinaryStatus> {
    try {
      const binaryInfo = await this.binaryManager.getBinaryInfo();
      const isSupported = this.binaryManager.isSupportedPlatform();
      const isRunning =
        this.currentProcess !== null && !this.currentProcess.killed;

      return {
        isInstalled: binaryInfo.exists,
        isExecutable: binaryInfo.executable,
        isRunning,
        isSupported,
        binaryInfo,
      };
    } catch (error) {
      console.error("Failed to get binary status:", error);
      return {
        isInstalled: false,
        isExecutable: false,
        isRunning: false,
        isSupported: this.binaryManager.isSupportedPlatform(),
      };
    }
  }

  /**
   * Start binary process
   */
  async startBinary(args: string[] = []): Promise<BinaryProcess> {
    try {
      // Stop existing process if running
      if (this.currentProcess && !this.currentProcess.killed) {
        await this.stopBinary();
      }

      // Ensure binary exists and is executable
      const binaryPath = await this.binaryManager.ensureBinaryExists();

      // Default arguments for the binary
      const defaultArgs = ["--port", "8080"];
      const finalArgs = [...defaultArgs, ...args];

      console.log("Starting binary:", binaryPath, "with args:", finalArgs);

      // Spawn the binary process
      this.currentProcess = spawn(binaryPath, finalArgs, {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          // Add any specific environment variables your binary needs
        },
        detached: false, // Keep attached to parent process for easier cleanup
      });

      const startTime = new Date();
      let processStatus: BinaryProcess["status"] = "starting";

      // Handle process events
      this.currentProcess.on("spawn", () => {
        console.log(
          `Binary process spawned with PID: ${this.currentProcess?.pid}`
        );
        processStatus = "running";
      });

      this.currentProcess.on("error", (error) => {
        console.error("Binary process error:", error);
        processStatus = "error";
        this.currentProcess = null;
      });

      this.currentProcess.on("exit", (code, signal) => {
        console.log(
          `Binary process exited with code: ${code}, signal: ${signal}`
        );
        processStatus = "stopped";
        this.currentProcess = null;
      });

      // Handle stdout
      this.currentProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("Binary stdout:", output);
        if (this.streamCallback) {
          this.streamCallback({ data: output, isError: false });
        }
      });

      // Handle stderr
      this.currentProcess.stderr?.on("data", (data) => {
        const output = data.toString();
        console.error("Binary stderr:", output);
        if (this.streamCallback) {
          this.streamCallback({ data: output, isError: true });
        }
      });

      // Wait a bit to ensure the process starts properly
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if process is still running
      if (this.currentProcess?.killed || !this.currentProcess?.pid) {
        throw new Error(
          "Binary process failed to start or crashed immediately"
        );
      }

      return {
        pid: this.currentProcess.pid,
        port: 8080, // Default port, adjust as needed
        startTime,
        status: processStatus,
      };
    } catch (error) {
      console.error("Failed to start binary:", error);
      this.currentProcess = null;
      throw error;
    }
  }

  /**
   * Stop binary process
   */
  async stopBinary(pid?: number): Promise<boolean> {
    try {
      if (!this.currentProcess) {
        console.log("No binary process to stop");
        return true;
      }

      // If PID is specified, verify it matches current process
      if (pid && this.currentProcess.pid !== pid) {
        console.warn(
          `PID mismatch: expected ${pid}, got ${this.currentProcess.pid}`
        );
        return false;
      }

      const processToKill = this.currentProcess;
      this.currentProcess = null;

      if (processToKill.killed) {
        console.log("Binary process already killed");
        return true;
      }

      // Try graceful shutdown first
      console.log("Sending SIGTERM to binary process...");
      processToKill.kill("SIGTERM");

      // Wait for graceful shutdown
      const gracefulShutdown = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5000); // 5 second timeout

        processToKill.on("exit", () => {
          clearTimeout(timeout);
          resolve(true);
        });
      });

      if (gracefulShutdown) {
        console.log("Binary process stopped gracefully");
        return true;
      }

      // Force kill if graceful shutdown failed
      console.log("Graceful shutdown failed, force killing binary process...");
      processToKill.kill("SIGKILL");

      // Wait a bit more for force kill
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Binary process force killed");
      return true;
    } catch (error) {
      console.error("Failed to stop binary process:", error);
      return false;
    }
  }

  /**
   * Execute command through the binary
   */
  async executeCommand(command: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.currentProcess || this.currentProcess.killed) {
        reject(new Error("Binary process is not running"));
        return;
      }

      let output = "";
      let errorOutput = "";

      // For command execution, we might need to send commands to stdin
      // or use a different approach depending on how your binary handles commands

      // Example: sending command to stdin
      const commandString = command.join(" ") + "\n";

      // Temporary listeners for this command
      const onData = (data: Buffer) => {
        output += data.toString();
      };

      const onError = (data: Buffer) => {
        errorOutput += data.toString();
      };

      this.currentProcess.stdout?.on("data", onData);
      this.currentProcess.stderr?.on("data", onError);

      // Send command
      this.currentProcess.stdin?.write(commandString);

      // Set a timeout for command execution
      const timeout = setTimeout(() => {
        this.currentProcess?.stdout?.off("data", onData);
        this.currentProcess?.stderr?.off("data", onError);

        if (errorOutput) {
          reject(new Error(`Command execution failed: ${errorOutput}`));
        } else {
          resolve(output);
        }
      }, 30000); // 30 second timeout

      // Clean up listeners after timeout
      setTimeout(() => {
        clearTimeout(timeout);
        this.currentProcess?.stdout?.off("data", onData);
        this.currentProcess?.stderr?.off("data", onError);
      }, 30100);
    });
  }

  /**
   * Execute command with streaming output
   */
  async executeCommandWithStreaming(command: string[]): Promise<string> {
    // For streaming commands, we rely on the existing stdout/stderr handlers
    // and the stream callback set via onStreamData
    return await this.executeCommand(command);
  }

  /**
   * Set stream data callback
   */
  onStreamData(
    callback: (data: { data: string; isError: boolean }) => void
  ): void {
    this.streamCallback = callback;
  }

  /**
   * Remove stream data listener
   */
  removeStreamDataListener(): void {
    this.streamCallback = null;
  }

  /**
   * Cleanup method - should be called when the app is closing
   */
  async cleanup(): Promise<void> {
    console.log("Cleaning up binary service...");
    if (this.currentProcess && !this.currentProcess.killed) {
      await this.stopBinary();
    }
    this.streamCallback = null;
  }
}

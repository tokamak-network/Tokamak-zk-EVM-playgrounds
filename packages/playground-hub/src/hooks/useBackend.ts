import { useCallback } from "react";
import { useDocker } from "./useDocker";
export const useBackendCommand = () => {
  const { executeCommand } = useDocker();

  const compileQAP = useCallback(
    async (containerId: string) => {
      try {
        // console.log("compileQAP", containerId);
        // const result = await executeCommand(containerId, [
        //   "bash",
        //   "-c",
        //   `cd packages/frontend/qap-compiler && ./scripts/compile.sh > /proc/1/fd/1 2>/proc/1/fd/2`,
        // ]);
        // console.log("result", result);
        // return result;
        return Promise.resolve(true);
      } catch (error) {
        throw new Error("Failed to execute Docker command:", error);
      }
    },
    [executeCommand]
  );

  const setup = useCallback(
    async (containerId: string) => {
      try {
        // console.log("setup", containerId);
        // const result = await executeCommand(containerId, [
        //   "bash",
        //   "-c",
        //   `cd packages/backend && cargo run -p trusted-setup > /proc/1/fd/1 2>/proc/1/fd/2`,
        // ]);
        // console.log("result", result);
        // return result;
        return Promise.resolve(true);
      } catch (error) {
        throw new error("Failed to execute Docker command:", error);
      }
    },
    [executeCommand]
  );

  const preProcess = useCallback(
    async (containerId: string) => {
      try {
        console.log("preProcess", containerId);
        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd packages/backend && cargo run -p preprocess > /proc/1/fd/1 2>/proc/1/fd/2`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.log("error", error);
        throw new Error("Failed to execute Docker command:", error);
      }
    },
    [executeCommand]
  );

  const prove = useCallback(
    async (containerId: string) => {
      try {
        console.log("prove", containerId);
        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd packages/backend && cargo run -p prove > /proc/1/fd/1 2>/proc/1/fd/2`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        throw new Error("Failed to execute Docker command:", error);
      }
    },
    [executeCommand]
  );

  const verify = useCallback(
    async (containerId: string) => {
      try {
        console.log("verify", containerId);
        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd packages/backend && cargo run -p verify > /proc/1/fd/1 2>/proc/1/fd/2`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        throw new Error("Failed to execute Docker command:", error);
      }
    },
    [executeCommand]
  );

  return { compileQAP, setup, preProcess, prove, verify };
};

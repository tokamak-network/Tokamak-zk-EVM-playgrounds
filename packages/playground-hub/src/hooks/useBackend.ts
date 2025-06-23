import { useCallback } from "react";
import { useDocker } from "./useDocker";
export const useBackendCommand = () => {
  const { executeCommand } = useDocker();

  const setup = useCallback(
    async (containerId: string) => {
      try {
        console.log("setup", containerId);
        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd packages/backend && 
        cargo run -p trusted-setup`,
        ]);
        console.log("result", result);
        return result;
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
          `cd packages/backend && 
        cargo run -p preprocess`,
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
          `cd packages/backend && 
        cargo run -p prove`,
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
          `cd packages/backend && 
        cargo run -p verify`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        throw new Error("Failed to execute Docker command:", error);
      }
    },
    [executeCommand]
  );

  return { setup, preProcess, prove, verify };
};

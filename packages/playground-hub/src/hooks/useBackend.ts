import { useCallback } from "react";
import { useDocker } from "./useDocker";
import { useCuda } from "./useCuda";

export const useBackendCommand = () => {
  const { executeCommand } = useDocker();
  const { cudaStatus } = useCuda();

  const setup = useCallback(
    async (containerId: string) => {
      try {
        console.log("setup", containerId);

        // CUDA를 지원하지 않는 환경이면 성공으로 처리
        if (!cudaStatus.isFullySupported) {
          console.log("CUDA not available, skipping CUDA-dependent setup");
          return Promise.resolve(true);
        }

        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd packages/backend && 
        cargo run -p trusted-setup`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        throw new Error("Failed to execute Docker command: " + error);
      }
    },
    [executeCommand, cudaStatus.isFullySupported]
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
        throw new Error("Failed to execute Docker command: " + error);
      }
    },
    [executeCommand]
  );

  const prove = useCallback(
    async (containerId: string) => {
      try {
        console.log("prove", containerId);

        // CUDA를 지원하지 않는 환경이면 성공으로 처리
        if (!cudaStatus.isFullySupported) {
          console.log("CUDA not available, skipping CUDA-dependent prove");
          return Promise.resolve(true);
        }

        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd packages/backend && 
        cargo run -p prove`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        throw new Error("Failed to execute Docker command: " + error);
      }
    },
    [executeCommand, cudaStatus.isFullySupported]
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
        throw new Error("Failed to execute Docker command: " + error);
      }
    },
    [executeCommand]
  );

  return { setup, preProcess, prove, verify };
};

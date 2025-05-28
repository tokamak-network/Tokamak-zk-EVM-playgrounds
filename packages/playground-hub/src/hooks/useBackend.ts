// import { useCallback } from "react";
// import { useDocker } from "./useDocker";
// export const useProve = () => {
//   const { executeCommand } = useDocker();

//   const prove = useCallback(
//     async (containerId: string) => {
//       try {
//         console.log("prove", containerId);
//         const result = await executeCommand(containerId, [
//           "bash",
//           "-c",
//           `cd /app/backend &&
//         cargo run -p protocol-script`,
//         ]);
//         console.log("result", result);
//         return result;
//       } catch (error) {
//         console.error("도커 명령 실행 실패:", error);
//         return null;
//       }
//     },
//     [executeCommand]
//   );

//   return { prove };
// };

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
          `cd /app/backend && 
        cargo run -p trusted-setup`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.error("Failed to execute Docker command:", error);
        return null;
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
          `cd /app/backend && 
        cargo run -p preprocess`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.error("Failed to execute Docker command:", error);
        return null;
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
          `cd /app/backend && 
        cargo run -p prove`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.error("Failed to execute Docker command:", error);
        return null;
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
          `cd /app/backend && 
        cargo run -p verify`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.error("Failed to execute Docker command:", error);
        return null;
      }
    },
    [executeCommand]
  );

  return { setup, preProcess, prove, verify };
};

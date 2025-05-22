// src/docker-service.ts
import { exec, spawn } from "child_process";

export interface DockerImage {
  name: string;
  size: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  status: string;
}

// Docker 상태 체크 함수
export async function checkDockerStatus(): Promise<{
  isInstalled: boolean;
  isRunning: boolean;
}> {
  return new Promise<{ isInstalled: boolean; isRunning: boolean }>(
    (resolve) => {
      // Docker 설치 여부 체크
      exec("docker --version", (error) => {
        if (error) {
          resolve({ isInstalled: false, isRunning: false });
          return;
        }

        // Docker 실행 여부 체크
        exec("docker info", (error) => {
          resolve({
            isInstalled: true,
            isRunning: !error,
          });
        });
      });
    }
  );
}

// Docker 이미지 목록 가져오기
export async function getDockerImages(): Promise<DockerImage[]> {
  return new Promise((resolve, reject) => {
    exec(
      'docker images --format "{{.Repository}}:{{.Tag}} ({{.Size}})"',
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error getting Docker images: ${error}`);
          reject(error);
          return;
        }

        const images: DockerImage[] = stdout
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const match = line.match(/(.*) \((.*)\)/);
            if (match) {
              return {
                name: match[1],
                size: match[2],
              };
            }
            return { name: line, size: "Unknown" };
          });

        resolve(images);
      }
    );
  });
}

// Docker 컨테이너 실행
export async function runDockerContainer(
  imageName: string,
  options: string[] = []
): Promise<DockerContainer> {
  return new Promise((resolve, reject) => {
    // 기본 인자 설정 (인터랙티브 모드로 실행)
    const args = ["run", "-d", ...options, imageName];

    const dockerProcess = spawn("docker", args);
    let containerId = "";

    dockerProcess.stdout.on("data", (data) => {
      containerId += data.toString().trim();
    });

    dockerProcess.stderr.on("data", (data) => {
      console.error(`Docker error: ${data.toString()}`);
    });

    dockerProcess.on("close", (code) => {
      if (code === 0 && containerId) {
        // 컨테이너 정보 가져오기
        exec(
          `docker ps -f id=${containerId} --format "{{.ID}}|{{.Names}}|{{.Status}}"`,
          (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }

            const containerInfo = stdout.trim().split("|");
            if (containerInfo.length >= 3) {
              resolve({
                id: containerInfo[0],
                name: containerInfo[1],
                status: containerInfo[2],
              });
            } else {
              reject(new Error("Failed to get container info"));
            }
          }
        );
      } else {
        reject(new Error(`Failed to run Docker container. Exit code: ${code}`));
      }
    });
  });
}

// 실행 중인 Docker 컨테이너 목록 가져오기
export async function getDockerContainers(): Promise<DockerContainer[]> {
  return new Promise((resolve, reject) => {
    exec(
      'docker ps --format "{{.ID}}|{{.Names}}|{{.Status}}"',
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error getting Docker containers: ${error}`);
          reject(error);
          return;
        }

        const containers: DockerContainer[] = stdout
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const parts = line.split("|");
            return {
              id: parts[0] || "",
              name: parts[1] || "",
              status: parts[2] || "",
            };
          });

        resolve(containers);
      }
    );
  });
}

// 컨테이너 중지
export async function stopDockerContainer(
  containerId: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec(`docker stop ${containerId}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(true);
    });
  });
}

// Docker 컨테이너 내에서 명령어 실행
export async function executeCommandInContainer(
  containerId: string,
  command: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["exec", containerId, ...command];

    const process = spawn("docker", args);
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });
  });
}

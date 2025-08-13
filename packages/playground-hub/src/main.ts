import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  session,
  DownloadItem,
  screen,
  shell,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { exec, spawn } from "node:child_process";
import started from "electron-squirrel-startup";
import * as sudo from "sudo-prompt";
import {
  getDockerImages,
  runDockerContainer,
  getDockerContainers,
  stopDockerContainer,
  executeCommandInContainer,
  executeCommandInContainerWithStreaming,
  downloadLargeFileFromContainer,
  streamLargeFileFromContainer,
  checkDockerStatus,
} from "./api/docker-service";
import { BinaryService } from "./services/binaryService";
import { promisify } from "node:util";
const execAsync = promisify(exec);

let downloadItem: DownloadItem | null = null;

// Initialize binary service
let binaryService: BinaryService;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Default window size
  let width = 1200;
  let height = 800;

  // Try to get screen size if available
  try {
    const { width: screenWidth, height: screenHeight } =
      screen.getPrimaryDisplay().workAreaSize;
    width = screenWidth;
    height = screenHeight;
  } catch (error) {
    console.warn("Could not get screen size, using default:", error);
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // devTools: false,
    },
  });
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools(); // Commented out to prevent auto-opening DevTools

  // 외부 링크를 기본 브라우저에서 열도록 설정
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // will-navigate 이벤트도 처리 (추가 보안)
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // 외부 URL인 경우 기본 브라우저에서 열기
    if (parsedUrl.origin !== new URL(mainWindow.webContents.getURL()).origin) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // 메뉴 생성
  createMenu();
};

// 메뉴 생성 함수
function createMenu(): void {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = [
    // macOS에서는 첫 번째 메뉴가 앱 이름
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ] as MenuItemConstructorOptions[],
          },
        ]
      : []),
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    // {
    //   label: "Settings",
    //   submenu: [
    //     {
    //       label: "Etherscan API Key",
    //       click: openSettingsWindow,
    //     },
    //     { type: "separator" },
    //     {
    //       label: "Reset Paths",
    //       click: resetSettings,
    //     },
    //   ],
    // },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function resetSettings(): void {
  dialog.showMessageBox({
    type: "question",
    buttons: ["Yes", "No"],
    title: "Reset Paths",
    message: "경로 설정을 초기화하시겠습니까?",
  });
  // .then((result) => {
  //   if (result.response === 0) {
  //     store.store = {}; // 모든 설정 초기화
  //     // 또는 개별 속성 제거
  //     store.store.backendPath = undefined;
  //     store.store.qapCompilerPath = undefined;
  //     store.store.synthesizerPath = undefined;
  //   }
  // });
}

function openSettingsWindow(): void {
  const settingsWindow = new BrowserWindow({
    width: 430,
    height: 210,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/settings`);
  } else {
    settingsWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { hash: "settings" }
    );
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Removed app.on("ready") - using app.whenReady() instead to avoid duplicate initialization

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// CUDA 체크 함수들
async function checkNvidiaGPU(): Promise<{
  isAvailable: boolean;
  gpuInfo?: string;
  error?: string;
}> {
  try {
    console.log("🔍 Checking NVIDIA GPU with nvidia-smi...");

    // Windows에서는 nvidia-smi가 System32에 있을 수도 있음
    const isWindows = process.platform === "win32";
    const nvidiaCommand = isWindows
      ? "nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader,nounits"
      : "nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader,nounits";

    const { stdout } = await execAsync(nvidiaCommand, {
      timeout: 10000,
      // Windows에서 PATH 확장
      env: isWindows
        ? {
            ...process.env,
            PATH: `${process.env.PATH};C:\\Program Files\\NVIDIA Corporation\\NVSMI;C:\\Windows\\System32`,
          }
        : process.env,
    });

    console.log("✅ NVIDIA GPU detected:", stdout.trim());
    return {
      isAvailable: true,
      gpuInfo: stdout.trim(),
    };
  } catch (error) {
    console.log("❌ NVIDIA GPU check failed:", error.message);

    // Windows에서 추가 체크 - wmic을 사용한 GPU 정보 확인
    if (process.platform === "win32") {
      try {
        console.log("🔍 Trying alternative GPU detection with wmic...");
        const { stdout: wmicOutput } = await execAsync(
          "wmic path win32_VideoController get name",
          {
            timeout: 5000,
          }
        );

        if (
          wmicOutput.toLowerCase().includes("nvidia") ||
          wmicOutput.toLowerCase().includes("geforce") ||
          wmicOutput.toLowerCase().includes("rtx")
        ) {
          console.log("✅ NVIDIA GPU found via wmic:", wmicOutput.trim());
          return {
            isAvailable: true,
            gpuInfo: wmicOutput.trim().replace(/\s+/g, " "),
            error: "nvidia-smi not accessible, but NVIDIA GPU detected",
          };
        }
      } catch (wmicError) {
        console.log("❌ wmic GPU check also failed:", wmicError.message);
      }
    }

    return {
      isAvailable: false,
      error:
        error.message || "NVIDIA GPU not found or nvidia-smi not available",
    };
  }
}

async function checkCudaCompiler(): Promise<{
  isAvailable: boolean;
  version?: string;
  error?: string;
}> {
  try {
    console.log("🔍 Checking CUDA compiler (nvcc)...");

    const isWindows = process.platform === "win32";
    const { stdout } = await execAsync("nvcc --version", {
      timeout: 10000,
      // Windows에서 CUDA PATH 확장
      env: isWindows
        ? {
            ...process.env,
            PATH: `${process.env.PATH};C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.8\\bin;C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v12.0\\bin;C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v12.1\\bin;C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v12.2\\bin`,
          }
        : process.env,
    });

    const versionMatch = stdout.match(/release (\d+\.\d+)/);
    const version = versionMatch ? versionMatch[1] : "Unknown";
    console.log(`✅ CUDA compiler found: ${version}`);

    return {
      isAvailable: true,
      version,
    };
  } catch (error) {
    console.log("❌ CUDA compiler check failed:", error.message);

    // Windows에서 추가 체크 - CUDA가 설치되어 있는지 레지스트리나 파일시스템으로 확인
    if (process.platform === "win32") {
      try {
        console.log("🔍 Checking for CUDA installation in Program Files...");
        const { stdout: dirOutput } = await execAsync(
          'dir "C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA" /b',
          {
            timeout: 5000,
          }
        );

        if (dirOutput.trim()) {
          console.log(
            "ℹ️ CUDA toolkit found in Program Files but nvcc not in PATH:",
            dirOutput.trim()
          );
          return {
            isAvailable: false,
            error:
              "CUDA toolkit installed but nvcc not in PATH. Please add CUDA bin directory to PATH.",
          };
        }
      } catch (dirError) {
        console.log("ℹ️ No CUDA installation found in Program Files");
      }
    }

    return {
      isAvailable: false,
      error: error.message || "CUDA compiler (nvcc) not found",
    };
  }
}

async function checkDockerCudaSupport(): Promise<{
  isSupported: boolean;
  error?: string;
}> {
  try {
    // 먼저 Docker가 실행 중인지 확인
    const dockerStatus = await checkDockerStatus();
    if (!dockerStatus.isInstalled || !dockerStatus.isRunning) {
      return {
        isSupported: false,
        error: "Docker is not installed or not running",
      };
    }

    // Step 1: Docker가 --gpus 옵션을 지원하는지 체크
    try {
      const { stdout } = await execAsync("docker run --help", {
        timeout: 5000,
      });

      if (!stdout.includes("--gpus")) {
        return {
          isSupported: false,
          error:
            "Docker does not support --gpus option (Docker version too old)",
        };
      }
    } catch (helpError) {
      return {
        isSupported: false,
        error: "Could not check Docker --gpus support",
      };
    }

    // Step 2: Docker info로 GPU 런타임 지원 확인
    try {
      console.log("🔍 Checking Docker info for GPU runtime support...");
      const { stdout } = await execAsync("docker info", {
        timeout: 10000,
      });

      // nvidia 런타임이나 GPU 관련 정보가 있는지 체크
      const hasNvidiaRuntime =
        stdout.toLowerCase().includes("nvidia") ||
        stdout.toLowerCase().includes("gpu") ||
        stdout.toLowerCase().includes("runtimes");

      if (hasNvidiaRuntime) {
        console.log("✅ Docker info shows GPU/NVIDIA runtime support");
      } else {
        console.log(
          "⚠️ Docker info does not show obvious GPU support, but continuing..."
        );
      }

      // Windows 백엔드 정보 체크
      if (process.platform === "win32") {
        if (stdout.toLowerCase().includes("wsl")) {
          console.log("✅ Docker is using WSL2 backend");
        } else if (stdout.toLowerCase().includes("hyper-v")) {
          console.log("✅ Docker is using Hyper-V backend");
        } else {
          console.log("ℹ️ Docker backend type not clearly identified");
        }

        // Windows Container Runtime 체크
        if (
          stdout.toLowerCase().includes("windowsfilter") ||
          stdout.toLowerCase().includes("windows")
        ) {
          console.log("ℹ️ Windows containers detected");
        }
      }
    } catch (infoError) {
      console.warn("❌ Could not get docker info:", infoError.message);
    }

    // Step 3: 가벼운 GPU 액세스 테스트 (실제 CUDA 이미지 없이)
    try {
      console.log("🔍 Testing GPU access with hello-world image...");
      // hello-world 이미지로 --gpus 옵션이 동작하는지만 테스트
      await execAsync("docker run --rm --gpus all hello-world", {
        timeout: 15000,
      });
      console.log("✅ Docker GPU access test passed with hello-world image");
      return { isSupported: true };
    } catch (helloWorldError) {
      console.log("❌ hello-world GPU test failed:", helloWorldError.message);

      // Step 4: nvidia/cuda 이미지가 이미 있는지 체크
      try {
        console.log("🔍 Looking for existing CUDA images...");
        const { stdout: imageList } = await execAsync(
          "docker images nvidia/cuda --format '{{.Repository}}:{{.Tag}}'",
          {
            timeout: 5000,
          }
        );

        if (imageList.trim()) {
          console.log("✅ Found existing CUDA images:", imageList.trim());
          // 기존 CUDA 이미지로 간단한 테스트
          const lines = imageList.trim().split("\n");
          const firstImage = lines[0];
          console.log(
            `🔍 Testing GPU access with existing image: ${firstImage}`
          );
          await execAsync(
            `docker run --rm --gpus all ${firstImage} nvidia-smi`,
            {
              timeout: 10000,
            }
          );
          console.log("✅ Docker CUDA test passed with existing image");
          return { isSupported: true };
        } else {
          console.log("ℹ️ No existing CUDA images found");
        }
      } catch (existingImageError) {
        console.log(
          "❌ Existing CUDA image test failed:",
          existingImageError.message
        );
      }
    }

    // 모든 테스트가 실패하면 GPU 지원 없음으로 판단
    const isWindows = process.platform === "win32";
    let errorMessage = "Docker GPU access not available.";

    if (isWindows) {
      errorMessage +=
        "\n\n🔧 Windows Docker Desktop GPU 설정 방법:\n" +
        "1. Docker Desktop 설정 열기\n" +
        "2. Settings → General → '✅ Use the WSL 2 based engine' 활성화\n" +
        "3. Settings → Resources → WSL Integration → '✅ Enable integration with my default WSL distro' 활성화\n" +
        "4. Docker Desktop 재시작\n" +
        "5. 최신 NVIDIA 드라이버 설치 확인\n\n" +
        "📝 참고: Docker Desktop 4.15+ 버전 권장";
    } else {
      errorMessage += " Please install nvidia-docker or enable GPU support.";
    }

    return {
      isSupported: false,
      error: errorMessage,
    };
  } catch (error) {
    return {
      isSupported: false,
      error: `Docker CUDA support check failed: ${error.message}`,
    };
  }
}

async function checkCudaSupport(): Promise<{
  isFullySupported: boolean;
  gpu: { isAvailable: boolean; gpuInfo?: string; error?: string };
  compiler: { isAvailable: boolean; version?: string; error?: string };
  dockerCuda: { isSupported: boolean; error?: string };
}> {
  const [gpu, compiler, dockerCuda] = await Promise.all([
    checkNvidiaGPU(),
    checkCudaCompiler(),
    checkDockerCudaSupport(),
  ]);

  return {
    isFullySupported:
      gpu.isAvailable && compiler.isAvailable && dockerCuda.isSupported,
    gpu,
    compiler,
    dockerCuda,
  };
}

// Register IPC handlers
function setupIpcHandlers() {
  console.log("Setting up IPC handlers..."); // Debug log for IPC handler setup
  ipcMain.handle("get-docker-images", async () => {
    return await getDockerImages();
  });

  ipcMain.handle(
    "run-docker-container",
    async (event, imageName: string, options: string[] = []) => {
      return await runDockerContainer(imageName, options);
    }
  );

  ipcMain.handle("get-docker-containers", async () => {
    return await getDockerContainers();
  });

  ipcMain.handle(
    "stop-docker-container",
    async (event, containerId: string, force?: boolean) => {
      return await stopDockerContainer(containerId, force);
    }
  );

  ipcMain.handle(
    "execute-command-in-container",
    async (event, containerId: string, command: string[]) => {
      return await executeCommandInContainer(containerId, command);
    }
  );

  ipcMain.handle(
    "execute-command-in-container-with-streaming",
    async (event, containerId: string, command: string[]) => {
      return await executeCommandInContainerWithStreaming(
        containerId,
        command,
        (data: string, isError: boolean) => {
          // 실시간으로 렌더러 프로세스에 데이터 전송
          event.sender.send("docker-stream-data", { data, isError });
        }
      );
    }
  );

  ipcMain.handle(
    "download-large-file-from-container",
    async (event, containerId: string, filePath: string) => {
      return await downloadLargeFileFromContainer(containerId, filePath);
    }
  );

  ipcMain.handle(
    "stream-large-file-from-container",
    async (
      event,
      containerId: string,
      containerFilePath: string,
      localFilePath: string
    ) => {
      return await streamLargeFileFromContainer(
        containerId,
        containerFilePath,
        localFilePath
      );
    }
  );

  // Shell API 핸들러 추가
  ipcMain.handle("open-external-url", async (event, url: string) => {
    try {
      console.log("🌐 Opening external URL in default browser:", url);
      await shell.openExternal(url);
      console.log("✅ Successfully opened external URL");
      return { success: true };
    } catch (error) {
      console.error("❌ Failed to open external URL:", error);
      return { success: false, error: error.message };
    }
  });

  let isShowingDialog = false;

  // Docker 상태 캐시 변수 추가
  let lastDockerStatus: { isInstalled: boolean; isRunning: boolean } | null =
    null;

  ipcMain.handle(
    "check-docker-status",
    async (event, imageNameToCheck?: string) => {
      const status = await checkDockerStatus(imageNameToCheck);

      // 상태가 변경되었을 때만 로그 출력
      if (
        !lastDockerStatus ||
        lastDockerStatus.isInstalled !== status.isInstalled ||
        lastDockerStatus.isRunning !== status.isRunning
      ) {
        console.log("Docker status changed:", {
          installed: status.isInstalled,
          running: status.isRunning,
        });
        lastDockerStatus = {
          isInstalled: status.isInstalled,
          isRunning: status.isRunning,
        };
      }

      if (!status.isInstalled && !isShowingDialog) {
        isShowingDialog = true;

        // 윈도우에서 더 자세한 안내 메시지
        const isWindows = process.platform === "win32";
        let message = "Docker is not installed on your system.";
        let detail = "Please install Docker Desktop to use this application.";

        if (isWindows) {
          message = "Docker Desktop을 찾을 수 없습니다.";
          detail = `Docker Desktop이 설치되어 있는지 확인해주세요.

🔧 Windows에서 Docker 설치 후 문제가 지속되는 경우:

1. 시스템 환경변수 PATH 확인:
   - Docker Desktop 설치 후 시스템 재시작
   - PATH에 Docker 경로 수동 추가 필요할 수 있음

2. Docker Desktop 서비스 상태 확인:
   - 작업 관리자에서 "Docker Desktop" 프로세스 확인
   - Windows 서비스에서 "com.docker.service" 상태 확인

3. 설치 경로 확인:
   - 일반적 경로: C:\\Program Files\\Docker\\Docker\\

4. WSL2 설정 확인:
   - Docker Desktop 설정에서 WSL2 integration 활성화

문제가 지속되면 Docker Desktop을 다시 설치해보세요.`;
        }

        dialog
          .showMessageBox({
            type: "warning",
            title: isWindows
              ? "Docker Desktop 감지 실패"
              : "Docker Not Installed",
            message,
            detail,
            buttons: ["OK"],
            noLink: true,
            defaultId: 0,
            cancelId: 0,
          })
          .finally(() => {
            isShowingDialog = false;
          });
      } else if (status.isInstalled && !status.isRunning && !isShowingDialog) {
        isShowingDialog = true;
        const checkDockerRunning = async () => {
          const currentStatus = await checkDockerStatus();
          if (currentStatus.isInstalled && !currentStatus.isRunning) {
            dialog
              .showMessageBox({
                type: "warning",
                title: "Docker Not Running",
                message: "Docker Desktop is not running.",
                detail: "Please start Docker Desktop to use this application.",
                buttons: ["OK"],
                noLink: true,
                defaultId: 0,
                cancelId: 0,
              })
              .then(async () => {
                const updatedStatus = await checkDockerStatus();
                if (!updatedStatus.isRunning) {
                  if (isShowingDialog) checkDockerRunning();
                } else {
                  isShowingDialog = false;
                }
              })
              .catch(() => {
                isShowingDialog = false;
              });
          } else {
            isShowingDialog = false;
          }
        };
        checkDockerRunning();
      }

      return status;
    }
  );

  ipcMain.handle("close-settings-window", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  // --- 파일 다운로드 및 Docker 이미지 로드 핸들러 시작 ---
  ipcMain.handle(
    "download-and-load-docker-image",
    async (event, args: { url: string; filename?: string }) => {
      const { url, filename } = args;
      const webContents = event.sender;

      const dockerStatus = await checkDockerStatus();
      if (!dockerStatus.isInstalled || !dockerStatus.isRunning) {
        webContents.send("docker-load-status", {
          stage: "failed",
          message:
            "Docker is not installed or not running. Please check Docker Desktop.",
          error: "Docker not ready",
        });
        return {
          success: false,
          error: "Docker is not installed or not running.",
        };
      }

      const defaultSavePath = path.join(
        app.getPath("downloads"),
        filename || "downloaded-image.tar"
      );
      const dialogResult = await dialog.showSaveDialog({
        title: "Save Docker Image TAR",
        defaultPath: defaultSavePath,
        filters: [{ name: "TAR Archives", extensions: ["tar"] }],
      });

      if (dialogResult.canceled || !dialogResult.filePath) {
        webContents.send("docker-load-status", {
          stage: "failed",
          message: "Download canceled by user.",
        });
        return { success: false, error: "Download canceled by user." };
      }
      const filePath = dialogResult.filePath;

      try {
        webContents.send("docker-load-status", {
          stage: "downloading",
          message: "Starting download...",
        });
        await new Promise<void>((resolve, reject) => {
          session.defaultSession.removeAllListeners("will-download");

          session.defaultSession.once("will-download", (_e, item) => {
            downloadItem = item;
            item.setSavePath(filePath);

            item.on("updated", (_evt, state) => {
              if (state === "progressing") {
                if (item.getReceivedBytes() && item.getTotalBytes()) {
                  const progressData = {
                    percentage: Math.round(
                      (item.getReceivedBytes() / item.getTotalBytes()) * 100
                    ),
                    downloadedSize: item.getReceivedBytes(),
                    totalSize: item.getTotalBytes(),
                  };
                  webContents.send("download-progress", progressData);
                }
              }
            });

            item.on("done", (_evt, state) => {
              downloadItem = null;
              if (state === "completed") {
                webContents.send("download-progress", {
                  percentage: 100,
                  downloadedSize: item.getTotalBytes(),
                  totalSize: item.getTotalBytes(),
                });
                resolve();
              } else {
                reject(new Error(`Download failed: ${state}`));
              }
            });
          });
          session.defaultSession.downloadURL(url);
        });

        webContents.send("docker-load-status", {
          stage: "loading",
          message: "Download complete. Loading into Docker...",
        });

        return new Promise((resolveCmd, rejectCmd) => {
          const command = `docker load -i "${filePath}"`;
          exec(command, (error, stdout, stderr) => {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr)
                console.error(
                  `Failed to delete tar file: ${filePath}`,
                  unlinkErr
                );
            });

            if (error) {
              const errorMessage = `Docker load failed: ${error.message} (stderr: ${stderr || "N/A"})`;
              webContents.send("docker-load-status", {
                stage: "failed",
                message: errorMessage,
                error: error.message,
              });
              rejectCmd({ success: false, error: errorMessage });
              return;
            }
            const successMessage =
              stdout || "Docker image loaded successfully.";
            if (stderr && !stdout.includes(stderr.trim().split("\n")[0])) {
              console.warn(`Docker load stderr (may be warnings): ${stderr}`);
            }
            webContents.send("docker-load-status", {
              stage: "completed",
              message: successMessage,
            });
            resolveCmd({ success: true, message: successMessage });
          });
        });
      } catch (err) {
        webContents.send("docker-load-status", {
          stage: "failed",
          message: err.message || "An unknown error occurred during download.",
          error: err.message,
        });
        return {
          success: false,
          error: err.message || "An unknown error occurred.",
        };
      }
    }
  );

  ipcMain.on("pause-download", () => {
    if (downloadItem) {
      downloadItem.pause();
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send("docker-load-status", {
          stage: "paused",
          message: "Download paused.",
        });
      }
    }
  });

  ipcMain.on("resume-download", () => {
    if (downloadItem) {
      downloadItem.resume();
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send("docker-load-status", {
          stage: "downloading",
          message: "Download resumed.",
        });
      }
    }
  });

  ipcMain.handle(
    "show-save-dialog",
    async (event, defaultFileName, content) => {
      console.log("show-save-dialog called with:", {
        defaultFileName,
        contentLength: content?.length,
      });

      try {
        const { filePath } = await dialog.showSaveDialog({
          defaultPath: defaultFileName,
          filters: [{ name: "JSON", extensions: ["json"] }],
        });

        console.log("Dialog result:", { filePath });

        if (filePath) {
          try {
            fs.writeFileSync(filePath, content, "utf8");
            console.log("File saved successfully to:", filePath);
            return { filePath, success: true };
          } catch (writeError) {
            console.error("Failed to write file:", writeError);
            return { filePath, success: false, error: writeError.message };
          }
        }

        console.log("User cancelled save dialog");
        return { filePath: null, success: false, error: "User cancelled" };
      } catch (dialogError) {
        console.error("Failed to show save dialog:", dialogError);
        return { filePath: null, success: false, error: dialogError.message };
      }
    }
  );

  // Large file save dialog - only shows dialog without writing content
  ipcMain.handle(
    "show-large-file-save-dialog",
    async (event, defaultFileName) => {
      console.log("show-large-file-save-dialog called with:", {
        defaultFileName,
      });

      try {
        const { filePath } = await dialog.showSaveDialog({
          defaultPath: defaultFileName,
          filters: [{ name: "JSON", extensions: ["json"] }],
        });

        console.log("Large file dialog result:", { filePath });

        if (filePath) {
          return { filePath, success: true };
        }

        console.log("User cancelled large file save dialog");
        return { filePath: null, success: false, error: "User cancelled" };
      } catch (dialogError) {
        console.error("Failed to show large file save dialog:", dialogError);
        return { filePath: null, success: false, error: dialogError.message };
      }
    }
  );

  // --- 파일 다운로드 및 Docker 이미지 로드 핸들러 끝 ---

  ipcMain.on("request-exit-modal", () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const webContents = windows[0].webContents; // 첫 번째 창의 webContents를 가져옵니다.
      webContents.send("show-exit-modal"); // 렌더러 프로세스에 메시지 전송
    }
  });

  ipcMain.handle("get-env-vars", () => {
    return {
      RPC_URL: process.env.RPC_URL,
    };
  });

  // CUDA 체크 핸들러들
  ipcMain.handle("check-cuda-support", async () => {
    return await checkCudaSupport();
  });

  ipcMain.handle("check-nvidia-gpu", async () => {
    return await checkNvidiaGPU();
  });

  ipcMain.handle("check-cuda-compiler", async () => {
    return await checkCudaCompiler();
  });

  ipcMain.handle("check-docker-cuda-support", async () => {
    return await checkDockerCudaSupport();
  });

  // Binary Service IPC Handlers
  ipcMain.handle("binary-get-info", async () => {
    return await binaryService.getBinaryInfo();
  });

  ipcMain.handle("binary-get-status", async () => {
    return await binaryService.getBinaryStatus();
  });

  ipcMain.handle("binary-start", async (event, args: string[] = []) => {
    return await binaryService.startBinary(args);
  });

  ipcMain.handle("binary-stop", async (event, pid?: number) => {
    return await binaryService.stopBinary(pid);
  });

  ipcMain.handle("binary-execute-command", async (event, command: string[]) => {
    return await binaryService.executeCommand(command);
  });

  ipcMain.handle(
    "binary-execute-command-streaming",
    async (event, command: string[]) => {
      return await binaryService.executeCommandWithStreaming(command);
    }
  );

  // Set up streaming callback for binary service
  ipcMain.handle("binary-setup-streaming", async (event) => {
    binaryService.onStreamData(({ data, isError }) => {
      event.sender.send("binary-stream-data", { data, isError });
    });
    return true;
  });

  ipcMain.handle("binary-remove-streaming", async () => {
    binaryService.removeStreamDataListener();
    return true;
  });

  // System command execution (for shell scripts and system commands)
  ipcMain.handle("system-execute-command", async (event, command: string[]) => {
    try {
      console.log("Executing system command:", command);

      // Process command arguments to handle path resolution
      const workingDirectory = app.isPackaged
        ? process.resourcesPath
        : app.getAppPath();

      const processedCommand = command.map((arg) => {
        if (arg.startsWith("src/binaries/")) {
          if (app.isPackaged) {
            // Production: resources folder (src/ prefix is removed in extraResource)
            const resourcePath = arg.substring(4); // Remove "src/"
            return path.join(process.resourcesPath, resourcePath);
          } else {
            // Development: source directory
            return path.join(app.getAppPath(), arg);
          }
        }
        return arg;
      });

      console.log("Processed command:", processedCommand);
      console.log("Working directory:", workingDirectory);

      // Ensure script has execute permissions if it's a shell script
      if (processedCommand[0] && processedCommand[0].endsWith(".sh")) {
        try {
          fs.chmodSync(processedCommand[0], "755");
          console.log(
            `Set execute permissions for script: ${processedCommand[0]}`
          );

          // Also ensure all binaries in backend/bin have execute permissions
          let backendBinDir: string;
          if (app.isPackaged) {
            backendBinDir = path.join(
              process.resourcesPath,
              "binaries",
              "backend",
              "bin"
            );
          } else {
            backendBinDir = path.join(
              app.getAppPath(),
              "src",
              "binaries",
              "backend",
              "bin"
            );
          }

          if (fs.existsSync(backendBinDir)) {
            const binFiles = fs.readdirSync(backendBinDir);
            for (const binFile of binFiles) {
              const binPath = path.join(backendBinDir, binFile);
              try {
                fs.chmodSync(binPath, "755");
                console.log(`Set execute permissions for binary: ${binPath}`);
              } catch (binChmodError) {
                console.warn(
                  `Failed to set execute permissions for binary ${binPath}: ${binChmodError}`
                );
              }
            }
          }

          // On macOS, remove quarantine attribute
          if (process.platform === "darwin" && app.isPackaged) {
            try {
              // Remove quarantine from script
              await new Promise<void>((resolve) => {
                exec(
                  `xattr -d com.apple.quarantine "${processedCommand[0]}"`,
                  (error: any) => {
                    if (error) {
                      console.warn(
                        `Failed to remove quarantine from script: ${error.message}`
                      );
                    }
                    resolve();
                  }
                );
              });

              // Remove quarantine from all binaries in backend/bin
              if (fs.existsSync(backendBinDir)) {
                const binFiles = fs.readdirSync(backendBinDir);
                for (const binFile of binFiles) {
                  const binPath = path.join(backendBinDir, binFile);
                  await new Promise<void>((resolve) => {
                    exec(
                      `xattr -d com.apple.quarantine "${binPath}"`,
                      (error: any) => {
                        if (error) {
                          console.warn(
                            `Failed to remove quarantine from binary ${binPath}: ${error.message}`
                          );
                        }
                        resolve();
                      }
                    );
                  });
                }
              }
            } catch (quarantineError) {
              console.warn(
                `Failed to remove quarantine attributes: ${quarantineError}`
              );
            }
          }
        } catch (chmodError) {
          console.warn(
            `Failed to set execute permissions for script: ${chmodError}`
          );
        }
      }

      return new Promise((resolve, reject) => {
        // Set working directory to backend directory for script execution
        let scriptWorkingDirectory: string;
        if (app.isPackaged) {
          scriptWorkingDirectory = path.join(
            process.resourcesPath,
            "binaries",
            "backend"
          );
        } else {
          scriptWorkingDirectory = path.join(
            app.getAppPath(),
            "src",
            "binaries",
            "backend"
          );
        }

        console.log("Script working directory:", scriptWorkingDirectory);
        console.log(
          "Script working directory exists:",
          fs.existsSync(scriptWorkingDirectory)
        );

        // Check if required directories exist
        const requiredDirs = [
          path.join(
            scriptWorkingDirectory,
            "resource",
            "qap_compiler",
            "library",
            "wasm"
          ),
          path.join(
            scriptWorkingDirectory,
            "resource",
            "synthesizer",
            "outputs"
          ),
          path.join(scriptWorkingDirectory, "resource", "setup", "output"),
          path.join(scriptWorkingDirectory, "resource", "preprocess", "output"),
          path.join(scriptWorkingDirectory, "bin"),
        ];

        for (const dir of requiredDirs) {
          console.log(
            `Directory ${path.basename(path.dirname(dir))}/${path.basename(dir)} exists:`,
            fs.existsSync(dir)
          );
          if (dir.includes("wasm") && fs.existsSync(dir)) {
            const wasmFiles = fs
              .readdirSync(dir)
              .filter((f) => f.endsWith(".wasm"));
            console.log(`WASM files found: ${wasmFiles.length} files`);
          }
        }

        const childProcess = spawn(
          processedCommand[0],
          processedCommand.slice(1),
          {
            stdio: ["pipe", "pipe", "pipe"],
            env: {
              ...process.env,
              // Add environment variables that might help with library loading
              DYLD_LIBRARY_PATH:
                process.platform === "darwin" ? "/opt/icicle/lib" : undefined,
              LD_LIBRARY_PATH:
                process.platform !== "darwin" ? "/opt/icicle/lib" : undefined,
            },
            cwd: scriptWorkingDirectory, // Set working directory to backend directory
          }
        );

        let output = "";
        let errorOutput = "";

        childProcess.stdout?.on("data", (data: Buffer) => {
          const text = data.toString();
          output += text;
          console.log("System command stdout:", text);
          event.sender.send("system-stream-data", {
            data: text,
            isError: false,
          });
        });

        childProcess.stderr?.on("data", (data: Buffer) => {
          const text = data.toString();
          errorOutput += text;
          console.error("System command stderr:", text);
          event.sender.send("system-stream-data", {
            data: text,
            isError: true,
          });
        });

        childProcess.on("close", (code: number) => {
          console.log(`System command exited with code: ${code}`);
          if (code === 0) {
            resolve(output);
          } else {
            reject(
              new Error(
                `System command failed with code ${code}: ${errorOutput}`
              )
            );
          }
        });

        childProcess.on("error", (error: Error) => {
          console.error("System command error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("Failed to execute system command:", error);
      throw error;
    }
  });

  // Read file from binary directory
  ipcMain.handle("binary-read-file", async (event, filePath: string) => {
    try {
      let fullPath: string;
      if (app.isPackaged) {
        // Production: resources folder (src/ prefix is removed in extraResource)
        const resourcePath = filePath.startsWith("src/")
          ? filePath.substring(4)
          : filePath;
        fullPath = path.join(process.resourcesPath, resourcePath);
      } else {
        // Development: source directory
        fullPath = path.join(app.getAppPath(), filePath);
      }
      console.log("Reading binary file:", fullPath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }

      const content = fs.readFileSync(fullPath, "utf8");
      console.log(
        `Successfully read file: ${fullPath} (${content.length} characters)`
      );
      return content;
    } catch (error) {
      console.error("Failed to read binary file:", error);
      throw error;
    }
  });

  // Direct binary execution (one-shot CLI commands)
  ipcMain.handle("binary-execute-direct", async (event, command: string[]) => {
    try {
      const binaryManager = new (
        await import("./utils/binaryManager")
      ).BinaryManager();
      await binaryManager.ensureBinaryExists();
      const binaryInfo = await binaryManager.getBinaryInfo();

      // Convert relative output paths to absolute paths
      const processedCommand = command.map((arg) => {
        if (arg.startsWith("src/binaries/")) {
          if (app.isPackaged) {
            // Production: resources folder (src/ prefix is removed in extraResource)
            const resourcePath = arg.substring(4); // Remove "src/"
            return path.join(process.resourcesPath, resourcePath);
          } else {
            // Development: source directory
            return path.join(app.getAppPath(), arg);
          }
        }
        return arg;
      });

      console.log(
        "Executing direct binary command:",
        binaryInfo.path,
        processedCommand
      );
      console.log("Working directory:", path.dirname(binaryInfo.path));
      console.log("Binary exists:", fs.existsSync(binaryInfo.path));

      return new Promise((resolve, reject) => {
        // Set working directory to the synthesizer directory
        const workingDirectory = path.dirname(binaryInfo.path);

        console.log("Setting working directory to:", workingDirectory);
        console.log(
          "Working directory exists:",
          fs.existsSync(workingDirectory)
        );

        // Try to execute via system command to bypass macOS security restrictions
        const fullCommand = [binaryInfo.path, ...processedCommand];
        console.log("Full command to execute:", fullCommand);

        const childProcess = spawn(fullCommand[0], fullCommand.slice(1), {
          stdio: ["pipe", "pipe", "pipe"],
          env: {
            ...process.env,
            // Add library paths for better compatibility
            DYLD_LIBRARY_PATH:
              process.platform === "darwin" ? "/opt/icicle/lib" : undefined,
            LD_LIBRARY_PATH:
              process.platform !== "darwin" ? "/opt/icicle/lib" : undefined,
          },
          cwd: workingDirectory,
          // Add shell execution for better compatibility
          shell: process.platform === "darwin",
        });

        let output = "";
        let errorOutput = "";

        childProcess.stdout?.on("data", (data: Buffer) => {
          const text = data.toString();
          output += text;
          console.log("Binary stdout:", text);
          event.sender.send("binary-stream-data", {
            data: text,
            isError: false,
          });
        });

        childProcess.stderr?.on("data", (data: Buffer) => {
          const text = data.toString();
          errorOutput += text;
          console.error("Binary stderr:", text);
          event.sender.send("binary-stream-data", {
            data: text,
            isError: true,
          });
        });

        childProcess.on("close", (code: number) => {
          console.log(`Binary process exited with code: ${code}`);
          if (code === 0) {
            resolve(output);
          } else {
            reject(
              new Error(
                `Binary process failed with code ${code}: ${errorOutput}`
              )
            );
          }
        });

        childProcess.on("error", (error: Error) => {
          console.error("Binary process error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("Failed to execute direct binary command:", error);
      throw error;
    }
  });

  // 환경 정보 제공 핸들러
  ipcMain.handle("get-environment-info", async () => {
    try {
      const cudaSupport = await checkCudaSupport();
      return {
        platform: process.platform,
        hasGpuSupport: cudaSupport.isFullySupported,
        gpuInfo: cudaSupport.gpu,
        cudaInfo: cudaSupport.compiler,
        dockerCudaInfo: cudaSupport.dockerCuda,
      };
    } catch (error) {
      console.error("Failed to get environment info:", error);
      return {
        platform: process.platform,
        hasGpuSupport: false,
        error: error.message,
      };
    }
  });

  // Password dialog handler for sudo operations
  ipcMain.handle("show-password-dialog", async (event, message?: string) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender);
    if (!mainWindow) return { success: false, error: "No window found" };

    try {
      // Use a custom input dialog approach for password input
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Password Required</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .dialog {
              background: white;
              border-radius: 8px;
              padding: 24px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              width: 400px;
              text-align: center;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            h2 {
              margin: 0 0 8px 0;
              font-weight: 600;
            }
            p {
              color: #666;
              margin: 0 0 24px 0;
              line-height: 1.4;
            }
            input[type="password"] {
              width: 100%;
              padding: 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 14px;
              margin-bottom: 20px;
              box-sizing: border-box;
            }
            .buttons {
              display: flex;
              gap: 12px;
              justify-content: flex-end;
            }
            button {
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              font-size: 14px;
              cursor: pointer;
            }
            .cancel {
              background: #f0f0f0;
              color: #333;
            }
            .submit {
              background: #007aff;
              color: white;
            }
            button:hover {
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="dialog">
            <div class="icon">🔐</div>
            <h2>Administrator Password Required</h2>
            <p>${message || "Administrator access is required to install system dependencies."}</p>
            <input type="password" id="password" placeholder="Enter your password" autofocus>
            <div class="buttons">
              <button class="cancel" onclick="window.close()">Cancel</button>
              <button class="submit" onclick="submitPassword()">OK</button>
            </div>
          </div>
          <script>
            function submitPassword() {
              const password = document.getElementById('password').value;
              if (password) {
                require('electron').ipcRenderer.send('password-submitted', password);
                window.close();
              } else {
                alert('Please enter your password');
              }
            }
            document.getElementById('password').addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                submitPassword();
              }
            });
          </script>
        </body>
        </html>
      `;

      return new Promise((resolve) => {
        const passwordWindow = new BrowserWindow({
          width: 450,
          height: 300,
          resizable: false,
          minimizable: false,
          maximizable: false,
          parent: mainWindow,
          modal: true,
          show: false,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          },
        });

        passwordWindow.loadURL(
          `data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`
        );
        passwordWindow.setMenuBarVisibility(false);
        passwordWindow.show();

        // Handle password submission
        ipcMain.once("password-submitted", (event, password) => {
          resolve({ success: true, password });
          passwordWindow.close();
        });

        // Handle window close
        passwordWindow.on("closed", () => {
          resolve({ success: false, error: "Password dialog cancelled" });
        });
      });
    } catch (error) {
      console.error("Password dialog error:", error);
      return { success: false, error: error.message };
    }
  });

  // Execute script content with OS native sudo prompt (to bypass file execution restrictions)
  ipcMain.handle(
    "system-execute-script-with-sudo",
    async (event, scriptPath: string) => {
      try {
        console.log(
          "Executing script content with native sudo prompt:",
          scriptPath
        );

        // Read script content with correct path resolution for packaged apps
        let fullScriptPath: string;
        if (app.isPackaged) {
          // Production: resources folder (src/ prefix is removed in extraResource)
          const resourcePath = scriptPath.startsWith("src/")
            ? scriptPath.substring(4)
            : scriptPath;
          fullScriptPath = path.join(process.resourcesPath, resourcePath);
        } else {
          // Development: source directory
          fullScriptPath = path.join(app.getAppPath(), scriptPath);
        }

        console.log("Resolved script path:", fullScriptPath);
        const scriptContent = fs.readFileSync(fullScriptPath, "utf8");

        // Create a command that executes the script content directly
        const workingDirectory = app.isPackaged
          ? process.resourcesPath
          : app.getAppPath();
        const fullCommand = `cd "${workingDirectory}" && bash -c '${scriptContent.replace(/'/g, "'\"'\"'")}'`;
        const options = {
          name: "Tokamak ZK EVM Playground",
          env: { ...process.env },
        };

        console.log("Executing script content via sudo");

        return new Promise((resolve, reject) => {
          sudo.exec(fullCommand, options, (error, stdout, stderr) => {
            if (error) {
              console.error("Sudo script execution error:", error);
              reject(
                new Error(`Sudo script execution failed: ${error.message}`)
              );
            } else {
              console.log("Sudo script execution completed successfully");
              console.log("stdout:", stdout);
              if (stderr) {
                console.log("stderr:", stderr);
              }
              resolve(stdout || "Script execution completed successfully");
            }
          });
        });
      } catch (error) {
        console.error("Failed to execute script with sudo:", error);
        throw error;
      }
    }
  );

  // Execute command with OS native sudo prompt
  ipcMain.handle(
    "system-execute-command-with-sudo",
    async (event, command: string[]) => {
      try {
        console.log(
          "Executing system command with native sudo prompt:",
          command
        );

        // Convert relative paths to absolute paths and set working directory
        const basePath = app.isPackaged
          ? process.resourcesPath
          : app.getAppPath();
        const processedCommand = command.map((arg) => {
          if (arg.startsWith("src/binaries/")) {
            if (app.isPackaged) {
              // Production: resources folder (src/ prefix is removed in extraResource)
              const resourcePath = arg.substring(4); // Remove "src/"
              return path.join(process.resourcesPath, resourcePath);
            } else {
              // Development: source directory
              return path.join(app.getAppPath(), arg);
            }
          }
          return arg;
        });

        // Prepend cd command to ensure correct working directory
        const fullCommand = `cd "${basePath}" && ${processedCommand.join(" ")}`;
        const options = {
          name: "Tokamak ZK EVM Playground",
          env: { ...process.env },
        };

        console.log("Processed command:", fullCommand);

        return new Promise((resolve, reject) => {
          sudo.exec(fullCommand, options, (error, stdout, stderr) => {
            if (error) {
              console.error("Sudo command error:", error);
              reject(new Error(`Sudo command failed: ${error.message}`));
            } else {
              console.log("Sudo command completed successfully");
              console.log("stdout:", stdout);
              if (stderr) {
                console.log("stderr:", stderr);
              }
              resolve(stdout || "Command completed successfully");
            }
          });
        });
      } catch (error) {
        console.error("Failed to execute sudo command:", error);
        throw error;
      }
    }
  );

  // System hardware information provider handler
  ipcMain.handle("get-system-info", async () => {
    console.log("get-system-info handler called"); // Debug log for handler invocation
    try {
      const memoryTotal = os.totalmem();
      const memoryFree = os.freemem();
      const cpus = os.cpus();
      const platform = os.platform();
      const release = os.release();
      const arch = os.arch();

      console.log(`Platform detected: ${platform}`); // Log for platform verification

      // Collect more accurate system information using platform-specific commands
      let cpuModel = cpus[0]?.model || "Unknown CPU";
      let osVersion = release;

      if (platform === "darwin") {
        // Collect macOS system information
        try {
          // Collect CPU information on macOS
          const { stdout: cpuInfo } = await execAsync(
            "sysctl -n machdep.cpu.brand_string"
          );
          if (cpuInfo.trim()) {
            cpuModel = cpuInfo.trim();
          }

          // Collect macOS version information
          const { stdout: versionInfo } = await execAsync(
            "sw_vers -productVersion"
          );
          if (versionInfo.trim()) {
            osVersion = `macOS ${versionInfo.trim()}`;
          }

          // Add build information
          const { stdout: buildInfo } = await execAsync(
            "sw_vers -buildVersion"
          );
          if (buildInfo.trim()) {
            osVersion += ` ${buildInfo.trim()}`;
          }
        } catch (error) {
          console.warn("Failed to get detailed macOS info:", error);
        }
      } else if (platform === "win32") {
        // Collect Windows system information using systeminfo command
        try {
          // Collect comprehensive system information using systeminfo command
          const { stdout: systemInfo } = await execAsync("systeminfo /fo csv", {
            timeout: 15000,
          });

          if (systemInfo.trim()) {
            // Parse CSV output (first line is header, second line is data)
            const lines = systemInfo.trim().split("\n");
            if (lines.length >= 2) {
              const headers = lines[0]
                .split('","')
                .map((h) => h.replace(/"/g, ""));
              const values = lines[1]
                .split('","')
                .map((v) => v.replace(/"/g, ""));

              // Find CPU information
              const processorIndex = headers.findIndex((h) =>
                h.includes("Processor(s)")
              );
              if (processorIndex !== -1 && values[processorIndex]) {
                // Extract first processor name from processor information
                const processorInfo = values[processorIndex];
                const processorMatch = processorInfo.match(
                  /\[01\]:\s*(.+?)(?:\s*~|\s*,|\s*$)/
                );
                if (processorMatch && processorMatch[1]) {
                  cpuModel = processorMatch[1].trim();
                }
              }

              // Find OS information
              const osNameIndex = headers.findIndex((h) =>
                h.includes("OS Name")
              );
              const osVersionIndex = headers.findIndex((h) =>
                h.includes("OS Version")
              );
              const osBuildIndex = headers.findIndex((h) =>
                h.includes("OS Build Type")
              );

              let osName = "";
              let osVer = "";
              let osBuild = "";

              if (osNameIndex !== -1 && values[osNameIndex]) {
                osName = values[osNameIndex].replace("Microsoft ", "").trim();
              }
              if (osVersionIndex !== -1 && values[osVersionIndex]) {
                osVer = values[osVersionIndex].trim();
              }
              if (osBuildIndex !== -1 && values[osBuildIndex]) {
                osBuild = values[osBuildIndex].trim();
              }

              if (osName) {
                osVersion = osName;
                if (osVer) osVersion += ` ${osVer}`;
                if (osBuild) osVersion += ` (${osBuild})`;
              }
            }
          }
        } catch (error) {
          console.warn("Failed to get Windows info via systeminfo:", error);
          // Fallback to wmic command
          try {
            const { stdout: cpuInfo } = await execAsync(
              'wmic cpu get name /format:value | findstr "Name="',
              { timeout: 10000 }
            );
            if (cpuInfo.trim()) {
              const match = cpuInfo.match(/Name=(.+)/);
              if (match && match[1]) {
                cpuModel = match[1].trim();
              }
            }
          } catch (wmicError) {
            console.warn("WMIC fallback also failed:", wmicError);
            // Try PowerShell as final fallback
            try {
              const { stdout: psInfo } = await execAsync(
                'powershell "Get-CimInstance -ClassName Win32_Processor | Select-Object -ExpandProperty Name"',
                { timeout: 10000 }
              );
              if (psInfo.trim()) {
                cpuModel = psInfo.trim();
              }
            } catch (psError) {
              console.warn("PowerShell fallback also failed:", psError);
            }
          }
        }
      } else if (platform === "linux") {
        // Collect Linux system information
        try {
          // Collect CPU information on Linux
          const { stdout: cpuInfo } = await execAsync(
            "cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d':' -f2"
          );
          if (cpuInfo.trim()) {
            cpuModel = cpuInfo.trim();
          }

          // Collect Linux distribution information
          try {
            const { stdout: distroInfo } = await execAsync(
              "lsb_release -d -s 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d'\"' -f2"
            );
            if (distroInfo.trim()) {
              osVersion = distroInfo.trim();
            }
          } catch (distroError) {
            console.warn("Failed to get Linux distro info:", distroError);
          }
        } catch (error) {
          console.warn("Failed to get detailed Linux info:", error);
        }
      }

      return {
        cpu: {
          model: cpuModel,
          cores: cpus.length,
          threads: cpus.length, // Node.js에서는 논리 코어 수만 제공
          architecture: arch,
        },
        memory: {
          total: Math.round(memoryTotal / (1024 * 1024 * 1024)), // GB로 변환
          available: Math.round(memoryFree / (1024 * 1024 * 1024)), // GB로 변환
        },
        os: {
          platform:
            platform === "darwin"
              ? "macOS"
              : platform === "win32"
                ? "Windows"
                : platform,
          release: osVersion,
          version: `${platform} ${release} ${arch}`,
        },
      };
    } catch (error) {
      console.error("Failed to get system info:", error);
      return null;
    }
  });

  console.log("All IPC handlers registered successfully"); // Debug log for handler registration completion
}

app.whenReady().then(async () => {
  console.log("App ready, creating window...");

  // Initialize binary service
  binaryService = new BinaryService();
  console.log("Binary service initialized");

  // Ensure all backend binaries have execute permissions on startup
  try {
    let backendBinDir: string;
    if (app.isPackaged) {
      backendBinDir = path.join(
        process.resourcesPath,
        "binaries",
        "backend",
        "bin"
      );
    } else {
      backendBinDir = path.join(
        app.getAppPath(),
        "src",
        "binaries",
        "backend",
        "bin"
      );
    }

    if (fs.existsSync(backendBinDir)) {
      const binFiles = fs.readdirSync(backendBinDir);
      console.log(
        `Setting permissions for ${binFiles.length} backend binaries...`
      );

      for (const binFile of binFiles) {
        const binPath = path.join(backendBinDir, binFile);
        try {
          fs.chmodSync(binPath, "755");
          console.log(`Set execute permissions for: ${binFile}`);

          // On macOS, remove quarantine attribute
          if (process.platform === "darwin" && app.isPackaged) {
            await new Promise<void>((resolve) => {
              exec(
                `xattr -d com.apple.quarantine "${binPath}"`,
                (error: any) => {
                  if (error) {
                    console.warn(
                      `Failed to remove quarantine from ${binFile}: ${error.message}`
                    );
                  }
                  resolve();
                }
              );
            });
          }
        } catch (error) {
          console.warn(`Failed to set permissions for ${binFile}: ${error}`);
        }
      }
    }
  } catch (error) {
    console.warn("Failed to initialize backend binary permissions:", error);
  }

  // macOS에서만 dock 아이콘 설정
  if (process.platform === "darwin") {
    try {
      // 실제 소스 코드의 아이콘 파일 경로 (개발 모드 고려)
      const iconPath = path.resolve(
        process.cwd(),
        "src/assets/icons/app-icon.icns"
      );
      console.log("Setting dock icon:", iconPath);
      app.dock.setIcon(iconPath);
    } catch (error) {
      console.error("Failed to set dock icon:", error);
    }
  }
  setupIpcHandlers();
  process.env.PATH = `/usr/local/bin:${process.env.PATH}`;

  // Create the main window after all initialization is complete
  createWindow();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let isQuitting = false; // 애플리케이션 종료 진행 중 플래그

app.on("before-quit", async (event) => {
  if (isQuitting) {
    console.log(
      "[WARN] 'before-quit' 이벤트가 이미 처리 중이거나 완료되었습니다. 중복 호출을 무시합니다."
    );
    return; // 이미 종료 프로세스가 진행 중이면 아무것도 하지 않음
  }
  isQuitting = true; // 종료 프로세스 시작 플래그 설정
  console.log(
    "[INFO] 'before-quit' 이벤트 발생. 애플리케이션 종료를 준비합니다."
  );

  event.preventDefault(); // 애플리케이션이 즉시 종료되는 것을 방지

  ipcMain.emit("request-exit-modal");

  try {
    const containers = await getDockerContainers();
    console.log("[INFO] 현재 실행 중인 Docker 컨테이너 목록:", containers);

    if (containers && containers.length > 0) {
      const stopPromises = containers.map((container) => {
        console.log(`[INFO] Docker 컨테이너 중지 시도: ${container.ID}`);
        return stopDockerContainer(container.ID)
          .then(() =>
            console.log(`[SUCCESS] Docker 컨테이너 중지 완료: ${container.ID}`)
          )
          .catch((err) =>
            console.error(
              `[ERROR] Docker 컨테이너 ${container.ID} 중지 중 오류:`,
              err
            )
          );
      });

      await Promise.all(stopPromises);
      console.log(
        "[INFO] 모든 확인된 Docker 컨테이너의 중지 작업이 완료되었습니다."
      );
    } else {
      console.log("[INFO] 중지할 실행 중인 Docker 컨테이너가 없습니다.");
    }
  } catch (error) {
    console.error("[ERROR] Docker 컨테이너 중지 과정 중 예외 발생:", error);
  }

  // Clean up binary service
  try {
    console.log("[INFO] Binary service cleanup 시작...");
    if (binaryService) {
      await binaryService.cleanup();
      console.log("[SUCCESS] Binary service cleanup 완료");
    } else {
      console.log(
        "[INFO] Binary service가 초기화되지 않아 cleanup을 건너뜁니다."
      );
    }
  } catch (error) {
    console.error("[ERROR] Binary service cleanup 중 오류:", error);
  } finally {
    console.log(
      "[INFO] 모든 정리 작업 완료. 모든 창을 닫고 애플리케이션 실제 종료를 시도합니다."
    );
    BrowserWindow.getAllWindows().forEach((window) => {
      console.log(`[INFO] 창 강제 닫기 시도: ID ${window.id}`);
      window.destroy(); // 창을 강제로 닫음
    });

    // isQuitting 플래그가 true인 상태에서 app.quit()가 호출되어야 합니다.
    // 이 시점에서 추가적인 before-quit 이벤트가 발생해도 isQuitting 체크로 인해 무시됩니다.
    console.log("[INFO] app.quit() 호출 직전 (isQuitting: true).");
    app.quit();
  }
});

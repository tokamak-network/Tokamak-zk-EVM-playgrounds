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
import { exec } from "node:child_process";
import started from "electron-squirrel-startup";
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
import { promisify } from "node:util";
const execAsync = promisify(exec);

let downloadItem: DownloadItem | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
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
app.on("ready", async () => {
  const result = await dialog.showMessageBox({
    type: "question",
    buttons: ["Allow", "Deny"],
    title: "Permission Request",
    message: "This application needs access to Docker. Do you allow it?",
  });

  if (result.response === 0) {
    // 사용자가 허용한 경우
    console.log("Permission granted.");
    createWindow();
  } else {
    // 사용자가 거부한 경우
    console.log("Permission denied.");
    // 필요한 경우 앱 종료 또는 기능 비활성화
    app.quit();
  }
});

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

app.whenReady().then(() => {
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

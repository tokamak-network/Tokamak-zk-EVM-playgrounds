import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { spawn } from "child_process";
import fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
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
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// 원하는 경로 직접 지정
const backendPath =
  "/Users/son-yeongseong/Desktop/dev/Tokamak-zk-EVM-playgrounds/packages/Tokamak-zk-EVM/packages/backend";

// 경로가 존재하는지 확인
if (fs.existsSync(backendPath)) {
  console.log(`백엔드 경로가 존재합니다: ${backendPath}`);
} else {
  console.error(`경고: 백엔드 경로가 존재하지 않습니다: ${backendPath}`);
}

// IPC 핸들러 설정 - 이 부분이 있는지 확인
ipcMain.handle("execute-command", async (event, command) => {
  console.log(`명령어 실행: ${command}`);
  console.log(`실행 경로: ${backendPath}`);

  return new Promise((resolve, reject) => {
    // 명령어와 인수 분리
    const args = command.split(" ");
    const cmd = args.shift() || "";

    // spawn 사용 - stdio를 'inherit'로 설정하여 부모 프로세스의 stdio를 상속
    const process = spawn(cmd, args, {
      cwd: backendPath,
      stdio: "inherit", // 부모 프로세스의 stdio를 상속 (터미널에 직접 출력)
      shell: true, // 셸 사용
    });

    // 프로세스 종료 처리
    process.on("close", (code) => {
      console.log(`프로세스 종료 코드: ${code}`);
      if (code !== 0) {
        reject(`프로세스가 코드 ${code}로 종료되었습니다`);
      } else {
        resolve({ success: true, code });
      }
    });

    // 프로세스 오류 처리
    process.on("error", (err) => {
      console.error(`프로세스 오류: ${err}`);
      reject(err.message);
    });
  });
});

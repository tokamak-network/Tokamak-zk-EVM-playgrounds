import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { spawn } from "child_process";
import fs from "fs";
import Store from "electron-store";

// 설정을 위한 인터페이스
interface AppSettings {
  backendPath?: string;
  qapCompilerPath?: string;
  synthesizerPath?: string;
}

// 설정 저장소 초기화
const store = new Store<AppSettings>();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
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
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
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
    {
      label: "Settings",
      submenu: [
        {
          label: "Environment Paths",
          click: openSettingsWindow,
        },
        { type: "separator" },
        {
          label: "Reset Paths",
          click: resetSettings,
        },
      ],
    },
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
    width: 600,
    height: 400,
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

// Function to get all required paths
const getPaths = () => {
  // Distinguish between development and production mode
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  if (isDev) {
    // In development mode, use relative paths from project root
    const appRoot = app.getAppPath();
    console.log("Application root:", appRoot);

    // Relative paths from project root to each directory
    const tokamakRoot = path.join("..", "Tokamak-zk-EVM");

    const backendPath = path.resolve(
      appRoot,
      path.join(tokamakRoot, "packages", "backend")
    );
    const qapCompilerPath = path.resolve(
      appRoot,
      path.join(tokamakRoot, "packages", "frontend", "qap-compiler")
    );
    const synthesizerPath = path.resolve(
      appRoot,
      path.join(tokamakRoot, "packages", "frontend", "synthesizer")
    );

    console.log("Development mode paths:");
    console.log("- Backend:", backendPath);
    console.log("- QAP Compiler:", qapCompilerPath);
    console.log("- Synthesizer:", synthesizerPath);

    return {
      backendPath,
      qapCompilerPath,
      synthesizerPath,
    };
  } else {
    // In production mode, use paths within the application resources directory
    const resourcesPath = process.resourcesPath;
    console.log("Resources path:", resourcesPath);

    // Paths within the resources directory
    const backendPath = path.join(resourcesPath, "backend");
    const qapCompilerPath = path.join(resourcesPath, "qap-compiler");
    const synthesizerPath = path.join(resourcesPath, "synthesizer");

    console.log("Production mode paths:");
    console.log("- Backend:", backendPath);
    console.log("- QAP Compiler:", qapCompilerPath);
    console.log("- Synthesizer:", synthesizerPath);

    return {
      backendPath,
      qapCompilerPath,
      synthesizerPath,
    };
  }
};

// Get paths
const { backendPath, qapCompilerPath, synthesizerPath } = getPaths();

// Check if path exists
const checkPath = (pathToCheck: string, name: string) => {
  if (fs.existsSync(pathToCheck)) {
    console.log(`${name} path exists: ${pathToCheck}`);
    return true;
  } else {
    console.error(`Warning: ${name} path does not exist: ${pathToCheck}`);
    return false;
  }
};

checkPath(backendPath, "Backend");
checkPath(qapCompilerPath, "QAP Compiler");
checkPath(synthesizerPath, "Synthesizer");

// Create path map (used when executing commands)
const pathMap = {
  backend: backendPath,
  "qap-compiler": qapCompilerPath,
  synthesizer: synthesizerPath,
};

// Set up IPC handler
ipcMain.handle("execute-command", async (event, command) => {
  console.log(`Executing command: ${command}`);
  console.log(`Execution path: ${backendPath}`);

  return new Promise((resolve, reject) => {
    // Split command and arguments
    const args = command.split(" ");
    const cmd = args.shift() || "";

    // Use spawn with 'inherit' stdio to inherit parent process stdio
    const process = spawn(cmd, args, {
      cwd: pathMap.backend,
      stdio: "inherit", // Inherit parent process stdio (direct output to terminal)
      shell: true, // Use shell
    });

    // Handle process close
    process.on("close", (code) => {
      console.log(`Process exit code: ${code}`);
      if (code !== 0) {
        reject(`Process exited with code ${code}`);
      } else {
        resolve({ success: true, code });
      }
    });

    // Handle process error
    process.on("error", (err) => {
      console.error(`Process error: ${err}`);
      reject(err.message);
    });
  });
});

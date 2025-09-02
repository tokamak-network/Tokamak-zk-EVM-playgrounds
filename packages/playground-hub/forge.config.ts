import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // Platform-specific icon configuration
    ...(process.platform === "win32" && {
      icon: "src/assets/icons/favicon.ico",
    }),
    ...(process.platform === "darwin" && {
      icon: "src/assets/icons/app-icon.icns",
    }),
    // Windows-specific settings
    win32metadata: {
      CompanyName: "Tokamak Network",
      ProductName: "Tokamak zkEVM Playground Hub",
      FileDescription: "Tokamak zkEVM Playground Hub",
      OriginalFilename: "tokamak-zk-evm-playground-hub.exe",
    },
    // Include binary files, assets, and public folder in the app package
    extraResource: ["src/binaries", "src/assets", "public"],
    // Apple Developer certificate configuration (with file access permissions)
    ...(process.platform === "darwin" &&
      process.env.NODE_ENV === "production" && {
        osxSign: {
          // Certificate name (can be checked in Keychain)
          identity: "3524416ED3903027378EA41BB258070785F977F9",
        },
        // Notarization configuration (reduces security prompts)
        // TODO: Enable after getting Apple ID credentials from administrator
        // Uncomment the following block when ready for notarization:
        /*
        osxNotarize: {
          appleId: process.env.APPLE_ID || "",
          appleIdPassword: process.env.APPLE_ID_PASSWORD || "",
          teamId: process.env.APPLE_TEAM_ID || "B5WMFK82H9",
        },
        */
      }),
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      // Windows-specific configuration for Squirrel installer
      setupIcon: "src/assets/icons/favicon.ico",
    }),
    new MakerDMG(
      {
        // macOS DMG configuration
        icon: "src/assets/icons/app-icon.icns",
        format: "ULFO",
        // Remove background for cleaner look
        // background: "src/assets/icons/app-icon.png",
      },
      ["darwin"]
    ),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/main.ts"),
      },
    },
  },
  publicDir: "public",
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@muxit": path.resolve(__dirname, "src")
    }
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
  },
  build: {
    rollupOptions: {
      external: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
    }
  }
});

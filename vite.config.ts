import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  // After researching this, if this isn't added then the JS/CSS default to /index.css instead of /muxit/index.css
  // I currently need this for GitHub Pages, but using environment variables here allows it to be configured differently if needed, in future.
  base: process.env.VITE_BASE_PATH ?? "/",

  plugins: [react()],
  resolve: {
    alias: {
      "@muxit": path.resolve(__dirname, "src")
    }
  },
  // optimizeDeps: {
  //   exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
  // },
  // build: {
  //   rollupOptions: {
  //     external: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
  //   }
  // }
});

import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(() => {
  const apiTarget = process.env.VITE_API_TARGET || "http://localhost:3000";

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@runtime": path.resolve(__dirname, "..", "src")
      }
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true
        }
      },
      fs: {
        allow: [path.resolve(__dirname, "..")]
      }
    }
  };
});

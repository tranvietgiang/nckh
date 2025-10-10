import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173, // nên đồng nhất với port trong Docker
    watch: {
      usePolling: true, // 👈 giúp Vite detect thay đổi khi chạy trong Docker / Vagrant
    },
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
    },
  },
});

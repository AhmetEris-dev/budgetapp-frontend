import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // If CORS blocks, use relative /api/v1/... and proxy to backend
      "/api": {
        target: "http://localhost:9090",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Use regular plugin if not SWC
import path from "path";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",  // so phones on the same Wi-Fi can access it
    port: 8080,
    https: {},        // enable mkcert-based HTTPS
  },
  plugins: [
    react(),
    mkcert(),         // auto-trusted localhost certs
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

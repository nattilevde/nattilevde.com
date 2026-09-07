import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The React plugin was already a dependency but had no config to load it, so
// development ran without Fast Refresh. Everything else keeps Vite's defaults.
export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 5174 },
  preview: { host: "0.0.0.0" },
  build: {
    // The Three.js world is lazy-loaded as its own chunk and is legitimately
    // large; this keeps the build output honest instead of silencing warnings.
    chunkSizeWarningLimit: 700,
  },
});

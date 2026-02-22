import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url"; // ! ESM Fix

// --- Start ESM __dirname fix ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- End ESM __dirname fix ---
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    preserveSymlinks: true,

    alias: {
      "ynotsoft-dynamic-form": path.resolve(
        __dirname,
        "..",
        "dynamic-form-lib",
        "src",
      ),
      "ynotsoft-dynamic-grid": path.resolve(
        __dirname,
        "..",
        "dynamic-grid-lib",
        "src",
      ),
      "@": path.resolve(__dirname, "..", "dynamic-form-lib", "src"),
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: [
        ".", // project root
        "..", // parent folder
        "../ynotsoft-dynamic-form",
      ],
    },
  },
});

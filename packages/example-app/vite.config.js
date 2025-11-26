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
      // 1. Existing HMR Alias (package name -> library source)
      "@ynotsoft/dynamic-form": path.resolve(
        __dirname,
        "..",
        "dynamic-form-lib",
        "src",
      ),

      // 2. ! NEW ALIAS FIX: Map @/ to the library's internal source directory
      // This allows the library's imports (e.g., @/components) to resolve correctly
      "@": path.resolve(__dirname, "..", "dynamic-form-lib", "src"),
    },
  },
  server: {
    fs: {
      allow: [
        ".", // project root
        "..", // parent folder
        "../ynotsoft-dynamic-form",
      ],
    },
  },
});

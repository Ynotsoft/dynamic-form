import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ["ynotsoft-dynamic-form"],
    force: true,
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

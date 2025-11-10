import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    dedupe: ["react", "react-dom"], // 👈 key line to prevent duplicate Reacts
  },
  build: {
    lib: {
      entry: resolve("src/index.jsx"),
      name: "YnotsoftDynamicForm",
      formats: ["es", "umd"],
      fileName: (format) =>
        format === "umd" ? "dynamic-form.umd.cjs" : "dynamic-form.js",
      cssFileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-hot-toast",
        "dayjs",
        "dompurify",
        "@radix-ui/react-label",
        "@radix-ui/react-popover",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-select",
        "@radix-ui/react-separator",
        "react-select",
        "react-day-picker",
        "@heroicons/react/20/solid",
        "@heroicons/react/24/outline",
      ],
      output: {
        exports: "named",
        globals: {
          "react-dom": "ReactDom",
          react: "React",
          "react/jsx-runtime": "ReactJsxRuntime",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.fileName?.endsWith(".css")) {
            return "index.css";
          }
          // Use 'fileName' instead of 'name' for the placeholder
          return "[name][extname]";
        },
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    outDir: "dist",
  },
});

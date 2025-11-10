import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwind()],

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.jsx"),
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
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css") ? "index.css" : "[name][extname]",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-hot-toast": "reactHotToast",
          dayjs: "dayjs",
          dompurify: "DOMPurify",
          "@radix-ui/react-label": "RadixLabel",
          "@radix-ui/react-popover": "RadixPopover",
          "@radix-ui/react-radio-group": "RadixRadioGroup",
          "@radix-ui/react-select": "RadixSelect",
          "@radix-ui/react-separator": "RadixSeparator",
          "react-select": "ReactSelect",
          "react-day-picker": "ReactDayPicker",
          "@heroicons/react/20/solid": "HeroiconsSolid",
          "@heroicons/react/24/outline": "HeroiconsOutline",
        },
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    outDir: "dist",
  },
});

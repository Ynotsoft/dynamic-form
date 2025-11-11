// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    dedupe: ["react", "react-dom"],
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
        "react-select/animated", // ✅ add this
        "react-day-picker",
        "react-day-picker/dist/style.css", // ✅ also add the stylesheet
        "@heroicons/react/20/solid",
        "@heroicons/react/24/outline",
      ],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-hot-toast": "ReactHotToast",
          "react/jsx-runtime": "jsxRuntime", // 👈 add this
          dayjs: "dayjs",
          "react-select": "ReactSelect",
          "react-select/animated": "ReactSelectAnimated",
          "@radix-ui/react-select": "RadixSelect",
          "@radix-ui/react-label": "RadixLabel",
          "@radix-ui/react-popover": "RadixPopover",
          "@radix-ui/react-radio-group": "RadixRadioGroup",
          "@radix-ui/react-separator": "RadixSeparator",
          "react-day-picker": "ReactDayPicker",
          "@heroicons/react/20/solid": "HeroiconsSolid",
          "@heroicons/react/24/outline": "HeroiconsOutline",
        },
        assetFileNames: (assetInfo) =>
          assetInfo.fileName?.endsWith(".css")
            ? "index.css"
            : "[name][extname]",
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    outDir: "dist",
  },
});

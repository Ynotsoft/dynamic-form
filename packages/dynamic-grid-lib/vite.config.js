// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [react(), tailwind()],
	resolve: {
		dedupe: ["react", "react-dom"],
		alias: {
			"@": "/src",
		},
	},
	build: {
		lib: {
			entry: resolve("src/index.jsx"),
			name: "YnotsoftDynamicGrid",
			formats: ["es", "umd"],
			fileName: (format) =>
				format === "umd" ? "dynamic-grid.umd.cjs" : "dynamic-grid.js",
			cssFileName: "index",
		},
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"react-hot-toast",
				"dayjs",
				"react-select",
				"react-select/animated",
				"react-day-picker",
				"react-day-picker/dist/style.css",
			],
			output: {
				exports: "named",
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react-hot-toast": "ReactHotToast",
					"react/jsx-runtime": "jsxRuntime",
					dayjs: "dayjs",
					"react-select": "ReactSelect",
					"react-select/animated": "ReactSelectAnimated",
					"react-day-picker": "ReactDayPicker",
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

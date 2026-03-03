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
			"@": "/src", // Adjust this if your src folder is elsewhere
		},
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
				"@tiptap/react",
				"@tiptap/core",
				"@tiptap/starter-kit",
				"@tiptap/extension-underline",
				"@tiptap/extension-character-count",
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
					"@tiptap/react": "TiptapReact",
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

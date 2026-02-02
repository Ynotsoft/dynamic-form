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
			name: "YnotsoftDynamicDialog",
			formats: ["es", "umd"],
			fileName: (format) =>
				format === "umd" ? "dynamic-dialog.umd.cjs" : "dynamic-dialog.js",
			cssFileName: "index",
		},
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
			],
			output: {
				exports: "named",
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react/jsx-runtime": "jsxRuntime",
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

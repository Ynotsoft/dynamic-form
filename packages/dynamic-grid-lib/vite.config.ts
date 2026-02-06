import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		dts({
			entryRoot: "src",
			insertTypesEntry: true,
			rollupTypes: true,
		}),
	],

	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "YnotsoftDynamicGrid",
			formats: ["es", "umd"],
			fileName: (format) =>
				format === "umd" ? "dynamic-grid.umd.cjs" : "dynamic-grid.js",
		},
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"dompurify",
				"lucide-react",
			],
		},
	},
});

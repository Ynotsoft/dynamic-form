import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [
		react(),
		tailwind(),
		dts({
			entryRoot: "src",
			insertTypesEntry: true,
			rollupTypes: true,
		}),
	],

	resolve: {
		dedupe: ["react", "react-dom"],
		alias: {
			"@": "/src",
		},
	},

	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
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
				"react-select",
				"react-select/animated",
				"react-day-picker",
				"react-day-picker/dist/style.css",
			],
		},
	},
});

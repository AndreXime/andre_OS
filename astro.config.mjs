// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import preact from "@astrojs/preact";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
	site: "https://andreximenes.xyz",
	output: "static",
	build: {
		inlineStylesheets: "always",
	},

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				react: "preact/compat",
				"react-dom/test-utils": "preact/test-utils",
				"react-dom": "preact/compat",
				"react/jsx-runtime": "preact/jsx-runtime",
			},
		},
	},

	integrations: [preact()],
	adapter: vercel(),
});

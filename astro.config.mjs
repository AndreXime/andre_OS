// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import preact from "@astrojs/preact";

import vercel from "@astrojs/vercel";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	site: "https://andreximenes.xyz",
	output: "server",
	build: {
		inlineStylesheets: "always",
	},

	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [
		react({
			include: ["**/src/tools/**"],
		}),
		preact({
			exclude: ["**/src/tools/**"],
		}),
	],
	adapter: vercel(),
});

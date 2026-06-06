// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
	site: "https://andreximenes.xyz",
	output: "static",
	image: {
		remotePatterns: [{ protocol: "https" }],
	},
	build: {
		inlineStylesheets: "always",
	},

	vite: {
		plugins: [tailwindcss()],
		worker: {
			format: "es",
		},
	},

	integrations: [react(), sitemap()],
	adapter: vercel(),
});

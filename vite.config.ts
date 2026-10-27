import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sendary } from "sendary";

import { sitemapAndLlms } from "./plugins/sitemap-llms";

export default defineConfig({
  plugins: [react(), sendary({ compileOptions: {} }), sitemapAndLlms()],
});

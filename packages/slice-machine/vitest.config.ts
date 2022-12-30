import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import * as url from "node:url";
import * as path from "node:path";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    alias: {
      "@builders": path.resolve(__dirname, "./lib/builders"),
      "@components": path.resolve(__dirname, "./components"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@models": path.resolve(__dirname, "./lib/models"),
      "@src": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
      "@utils": path.resolve(__dirname, "./lib/utils"),
      components: path.resolve(__dirname, "./components"),
      lib: path.resolve(__dirname, "./lib"),
      tests: path.resolve(__dirname, "./tests"),
    },
    include: ["./test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "c8",
      reporter: ["lcovonly", "text"],
    },
    // Required to register jest-dom matchers and retain TypeScript support.
    globals: true,
    setupFiles: ["./test/__setup__.ts"],
    deps: {
      inline: true,
    },
  },
});

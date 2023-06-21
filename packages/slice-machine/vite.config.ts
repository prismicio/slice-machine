import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import * as url from "node:url";
import * as path from "node:path";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      "@builders": path.resolve(__dirname, "./lib/builders"),
      "@components": path.resolve(__dirname, "./components"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@models": path.resolve(__dirname, "./lib/models"),
      "@src": path.resolve(__dirname, "./src"),
      "@utils": path.resolve(__dirname, "./lib/utils"),
      test: path.resolve(__dirname, "./test"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["lcovonly", "text"],
    },
    // Required to register jest-dom matchers and retain TypeScript support.
    globals: true,
    setupFiles: ["./test/__setup__.ts"],
    deps: {
      inline:
        // TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
        [/^(?!.*vitest).*$/],
    },
  },
});

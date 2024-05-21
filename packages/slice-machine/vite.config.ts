import * as path from "node:path";
import * as url from "node:url";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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

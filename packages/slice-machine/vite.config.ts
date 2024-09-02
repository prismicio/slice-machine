import * as path from "node:path";
import * as url from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      unfetch: path.resolve(
        __dirname,
        "../../node_modules/unfetch/dist/unfetch.mjs", // fixes unfetch import issue (https://github.com/developit/unfetch/pull/164)
      ),
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

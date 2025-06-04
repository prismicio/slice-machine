import * as path from "node:path";
import * as url from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
});

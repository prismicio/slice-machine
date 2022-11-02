import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
  plugins: [sdk()],
  test: {
    coverage: {
      reporter: ["lcovonly", "text"],
    },
    setupFiles: ["./test/__setup__"],
  },
});

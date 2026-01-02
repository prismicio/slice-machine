import { defineConfig } from "vite";
import { builtinModules } from "node:module";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "./src/index.ts",
        cli: "./src/cli.ts",
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
    },
    target: "node18",
  },
  ssr: {
    noExternal: ["@slicemachine/manager", "@slicemachine/plugin-kit"],
  },
  define: {
    global: "globalThis",
  },
});

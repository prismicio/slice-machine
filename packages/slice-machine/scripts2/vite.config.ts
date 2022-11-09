import { defineConfig } from "vite";
import Module from "node:module";
import sdk from "vite-plugin-sdk";

import pkg from "../package.json";

const ignoreList = ["sys"];

export const builtins = Module.builtinModules
  .filter(
    (x) =>
      !/^_|^(internal|v8|node-inspect)\/|\//.test(x) && !ignoreList.includes(x)
  )
  .sort();

export default defineConfig({
  plugins: [sdk({ dts: false })],
  build: {
    emptyOutDir: true,
    outDir: "../build/scripts2",
    lib: {
      entry: ["./src/start.ts"],
    },
    //   lib: {
    //     entry: ["./src/start.ts"],
    //     formats: ["es", "cjs"],
    //     fileName: (format) => {
    //       switch (format) {
    //         case "es": {
    //           return "[name].mjs";
    //         }
    //
    //         case "cjs": {
    //           return "[name].cjs";
    //         }
    //       }
    //
    //       throw new Error(`Unsupported format: ${format}`);
    //     },
    //   },
    //   rollupOptions: {
    //     external: [
    //       // Node builtins with support for `node:` prefix.
    //       ...builtins.map((name) => new RegExp(`^(?:node:)?${name}(?:\/.*)?$`)),
    //       // `package.json` external dependencies, `devDependencies` should be inlined.
    //       ...Object.keys(pkg.dependencies ?? {}).map(
    //         (name) => new RegExp(`^${name}(?:\/.*)?$`)
    //       ),
    //     ],
    //     plugins: [
    //       // Preserve dynamic imports for CommonJS
    //       // TODO: Remove when Vite updates to Rollup v3. This behavior is enabled by default in v3.
    //       {
    //         name: "preserve-dynamic-imports",
    //         renderDynamicImport() {
    //           return { left: "import(", right: ")" };
    //         },
    //       },
    //     ],
    //   },
    //   minify: false,
    //   sourcemap: true,
  },
});

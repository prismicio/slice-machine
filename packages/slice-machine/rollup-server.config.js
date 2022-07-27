import esbuild from "rollup-plugin-esbuild";

export default {
  input: "./server/src/index.ts",
  output: {
    dir: "./build/server",
    format: "cjs",
  },
  plugins: [
    esbuild({
      exclude: /node_modules/,
      platform: "node",
      sourceMap: false,
      define: {
        "process.env.NEXT_PUBLIC_SM_UI_SEGMENT_KEY": process.env
          .NEXT_PUBLIC_SM_UI_SEGMENT_KEY
          ? `"${process.env.NEXT_PUBLIC_SM_UI_SEGMENT_KEY}"`
          : '""',
      },
      tsconfig: "./server/tsconfig.json",
    }),
  ],
};

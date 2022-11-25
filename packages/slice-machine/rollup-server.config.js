import esbuild from "rollup-plugin-esbuild";
import sentryRollupPlugin from "@sentry/rollup-plugin";
import path from "path";
import NodeUtils from "@slicemachine/core/build/node-utils";

const { SENTRY_AUTH_TOKEN } = process.env;
const pkg = NodeUtils.retrieveJsonPackage(path.resolve(__dirname));
/**
 * @type string
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const RELEASE_NUMBER = pkg.content.version;

export default {
  input: "./server/src/index.ts",
  output: {
    dir: "./build/server",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    esbuild({
      exclude: /node_modules/,
      platform: "node",
      define: {
        "process.env.PUBLIC_SM_UI_SEGMENT_KEY": process.env
          .PUBLIC_SM_UI_SEGMENT_KEY
          ? `"${process.env.PUBLIC_SM_UI_SEGMENT_KEY}"`
          : '"Ng5oKJHCGpSWplZ9ymB7Pu7rm0sTDeiG"',
      },
      tsconfig: "./server/tsconfig.json",
    }),
    // rollup seems to ignore `undefined` plugins
    SENTRY_AUTH_TOKEN &&
      sentryRollupPlugin({
        configFile: path.resolve(process.cwd(), "sentry-express.properties"),

        // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
        // and need `project:releases` and `org:read` scopes
        authToken: SENTRY_AUTH_TOKEN,

        // Optionally uncomment the line below to override automatic release name detection
        release: RELEASE_NUMBER,

        // Specify the directory containing build artifacts
        include: "./build/server",

        // sourcemaps don't appear to be working properly, with or without this prefix
        // the code is not minified so error source is still readable
        // we'll need to come back to this if we keep the express server after the plugin change
        urlPrefix: "~/server",
      }),
  ],
};

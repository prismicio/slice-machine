import esbuild from "rollup-plugin-esbuild";
import SentryCli from "@sentry/cli";
import path from "path";
import NodeUtils from "@slicemachine/core/build/node-utils";

const { SENTRY_AUTH_TOKEN } = process.env;

/**
 *
 * @param options
 *
 * @returns
 */
const customSentryPlugin = (options = {}) => {
  const { targets = [], hook = "buildEnd", enabled = false } = options; // FIX
  return {
    name: "custom-sentry-plugin",
    [hook]: async () => {
      if (!enabled) {
        return;
      }

      const pkg = NodeUtils.retrieveJsonPackage(path.resolve(__dirname));
      /**
       * @type string
       */
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const RELEASE_NUMBER = pkg.content.version;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const cli = new SentryCli(options.configFile);
      await cli.releases.new(RELEASE_NUMBER);
      await cli.releases.uploadSourceMaps(RELEASE_NUMBER, {
        include: [path.resolve(process.cwd(), "build", "server")],
      });
    },
  };
};

export default {
  input: "./server/src/index.ts",
  output: {
    dir: "./build/server",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    customSentryPlugin({
      enabled: SENTRY_AUTH_TOKEN,
      configFile: path.resolve(process.cwd(), "sentry-express.properties"),
    }),
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
  ],
};

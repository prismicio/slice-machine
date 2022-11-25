// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const withPlugins = require("next-compose-plugins");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const withCustomBabelConfigFile = require("next-plugin-custom-babel-config");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const withVideos = require("next-videos");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const NodeUtils = require("@slicemachine/core/build/node-utils");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const semver = require("semver");

const pkg = NodeUtils.retrieveJsonPackage(path.resolve(__dirname));

/**
 * @type string
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const RELEASE_NUMBER = pkg.content.version;
const isStableVersion =
  /^\d+\.\d+\.\d+$/.test(RELEASE_NUMBER) && semver.lte("0.1.0", RELEASE_NUMBER);

const nextConfig = {
  distDir: "./build/client",
  // generateBuildId: () => {
  //   // This controls the release number for Sentry
  //   return RELEASE_NUMBER;
  // },
  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,

    // This prevents a crash when doing the static export
    // There may be a way to completely disable the server part in which case this would become redundant
    // https://github.com/getsentry/sentry-javascript/issues/6088#issuecomment-1296797294
    autoInstrumentServerFunctions: false,

    // We need all the sourcemap uploaded to Sentry to get the complete trace
    // Not just the "pages"
    // Probably because of the static export
    widenClientFileUpload: true,
  },
  publicRuntimeConfig: {
    sentryEnvironment: isStableVersion ? process.env.NODE_ENV : "alpha",
  },
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
let exportedConfig = withPlugins(
  [
    [
      withCustomBabelConfigFile,
      {
        babelConfigFile: path.resolve("./babel.next.config.js"),
        webpack5: false,
        env: {
          // overridden by start script
          CWD: path.resolve("./tests/project"),
        },
        webpack: (config, { isServer }) => {
          if (!isServer) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            config.node = { fs: "empty", child_process: "empty" };
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          config.module.rules.push({
            test: /\.svg$/,
            issuer: {
              test: /\.(js|ts)x?$/,
            },
            use: ["@svgr/webpack"],
          });

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return config;
        },
      },
    ],
    withVideos,
  ],
  nextConfig
);

// The Sentry plugin does not work with next-compose-plugins
// The main config is not passed / handled
// It must be initialised separately
if (process.env.NODE_ENV !== "development") {
  console.log("**** ✅ NODE_ENV OK ");
  if (!process.env.SENTRY_AUTH_TOKEN) {
    console.log("**** ❌ SENTRY_AUTH_TOKEN KO");
    console.warn("⚠️ Creating a production build with no Sentry config");
    console.warn(
      "⚠️ A release won't be created and the sourcemap won't be uploaded"
    );
    console.warn("⚠️ To fix this add SENTRY_AUTH_TOKEN to your environment");
  } else {
    console.log("**** ✅ SENTRY_AUTH_TOKEN OK");
    const sentryWebpackPluginOptions = {
      // Additional config options for the Sentry Webpack plugin. Keep in mind that
      // the following options are set automatically, and overriding them is not
      // recommended:
      //   release, url, org, project, authToken, configFile, stripPrefix,
      //   urlPrefix, include, ignore

      // silent: true, // Suppresses all logs

      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options.

      // The Sentry webpack plugin always ignores some files when uploading sourcemaps
      // We actually need them (because of the static export?) to get the complete trace in Sentry
      ignore: [],
      release: RELEASE_NUMBER,

      configFile: "sentry-next.properties",
    };

    exportedConfig = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
module.exports = exportedConfig;

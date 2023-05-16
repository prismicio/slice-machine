import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { withSentryConfig } from "@sentry/nextjs";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";
import semver from "semver";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/** @type {{ version: string }} */
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8")
);

/** @type string */

const RELEASE_NUMBER = pkg.version;
const isStableVersion =
  /^\d+\.\d+\.\d+$/.test(RELEASE_NUMBER) && semver.lte("0.1.0", RELEASE_NUMBER);

/** @type {import("next").NextConfig} */
let nextConfig = {
  swcMinify: true,
  publicRuntimeConfig: {
    sentryEnvironment: isStableVersion ? process.env.NODE_ENV : "alpha",
  },
};

if (process.env.NODE_ENV !== "development") {
  if (!process.env.SENTRY_AUTH_TOKEN) {
    console.warn("⚠️ Creating a production build with no Sentry config");
    console.warn(
      "⚠️ A release won't be created and the sourcemap won't be uploaded"
    );
    console.warn("⚠️ To fix this add SENTRY_AUTH_TOKEN to your environment");
  } else {
    const sentryWebpackPluginOptions = {
      // Additional config options for the Sentry Webpack plugin. Keep in mind that
      // the following options are set automatically, and overriding them is not
      // recommended:
      //   release, url, org, project, authToken, configFile, stripPrefix,
      //   urlPrefix, include, ignore

      silent: true, // Suppresses all logs

      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options.

      // The Sentry webpack plugin always ignores some files when uploading sourcemaps
      // We actually need them (because of the static export?) to get the complete trace in Sentry
      ignore: [],
      release: RELEASE_NUMBER,

      configFile: "sentry-next.properties",
    };

    nextConfig = withSentryConfig(
      {
        ...nextConfig,
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
      },
      sentryWebpackPluginOptions
    );
  }
}

const withVanillaExtract = createVanillaExtractPlugin();

export default withVanillaExtract(nextConfig);

import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

import { withSentryConfig } from "@sentry/nextjs";
import semver from "semver";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/** @type {{ name: string, version: string }} */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
);

const parsedPkgVersion = semver.parse(pkg.version);
if (parsedPkgVersion === null) {
  throw new Error(
    `Package \`${pkg.name}\` has an invalid version \`${pkg.version}\` in its manifest.`,
  );
}

let sentryEnvironment;
if (parsedPkgVersion.prerelease.length === 0) {
  sentryEnvironment = process.env.NODE_ENV;
} else if (
  parsedPkgVersion.prerelease[0] === "alpha" ||
  parsedPkgVersion.prerelease[0] === "beta"
) {
  sentryEnvironment = parsedPkgVersion.prerelease[0];
} else {
  throw new Error(
    `Invalid package version: \`${pkg.name}@${parsedPkgVersion.version}\`. The first prerelease component \`${parsedPkgVersion.prerelease[0]}\` must be either \`alpha\` or \`beta\`.`,
  );
}

/** @type {import("next").NextConfig} */
let nextConfig = {
  swcMinify: true,
  publicRuntimeConfig: { sentryEnvironment },
};

if (process.env.NODE_ENV !== "development") {
  nextConfig = {
    ...nextConfig,
    output: "export",
  };

  if (!process.env.SENTRY_AUTH_TOKEN) {
    console.warn("⚠️ Creating a production build with no Sentry config");
    console.warn(
      "⚠️ A release won't be created and the sourcemap won't be uploaded",
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
      release: parsedPkgVersion.version,

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
      sentryWebpackPluginOptions,
    );
  }
}

export default nextConfig;

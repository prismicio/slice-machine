// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { nextConfig as sentryNextConfig } from "@lib/env/sentry";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig() as {
  publicRuntimeConfig: { sentryEnvironment: string; sentryUiDns: string };
};

Sentry.init({
  dsn: `https://${sentryNextConfig.publicToken}@${sentryNextConfig.host}/${sentryNextConfig.projectId}`,
  tracesSampleRate: 0.05,
  tunnel: "/api/t",
  environment: publicRuntimeConfig.sentryEnvironment,
});

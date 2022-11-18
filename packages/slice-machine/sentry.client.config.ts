// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { nextConfig as sentryNextConfig } from "@lib/env/sentry";

Sentry.init({
  dsn: `https://${sentryNextConfig.publicToken}@${sentryNextConfig.host}/${sentryNextConfig.projectId}`,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  tunnel: "/api/sentry",
});

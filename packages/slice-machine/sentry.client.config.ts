// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import getConfig from "next/config";

type SMNextConfig = { publicRuntimeConfig: { release: string } };

const { publicRuntimeConfig } = getConfig() as SMNextConfig;

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// TODO add `DEV_ENABLE_SENTRY` in Readme
const initSentry =
  process.env.NODE_ENV !== "development" || process.env.DEV_ENABLE_SENTRY;

if (initSentry) {
  Sentry.init({
    // TODO need this value
    dsn: SENTRY_DSN || "",
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    tunnel: "/api/sentry",
    release: publicRuntimeConfig.release,
  });
}

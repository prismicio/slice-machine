import path from "path";

import * as Sentry from "@sentry/node";
import express from "express";

import NodeUtils from "@slicemachine/core/build/node-utils";
import getEnv from "./api/services/getEnv";
import semver from "semver";

export const useSentry = () => !process.env.NO_SENTRY;

export const initSentry = () => {
  if (!useSentry()) {
    return;
  }

  const pkg = NodeUtils.retrieveJsonPackage(path.join(__dirname, "../../")) as {
    content: { version: string };
  };
  const RELEASE_NUMBER = pkg.content.version;

  const isStableVersion =
    /^\d+\.\d+\.\d+$/.test(RELEASE_NUMBER) &&
    semver.lte("0.1.0", RELEASE_NUMBER);

  Sentry.init({
    dsn:
      process.env.SENTRY_EXPRESS_DSN ??
      "https://b673ba8b041d4449a0fb0a38691882dd@o146123.ingest.sentry.io/4504179268845568",
    release: RELEASE_NUMBER,
    environment: isStableVersion ? process.env.NODE_ENV : "alpha",
  });

  // TODO should we refresh on getState like frontend?
  getEnv()
    .then((state) => {
      Sentry.setUser({ id: state.env.prismicData.shortId });
      // TODO is state.env.repo the same as state.env.client.repository?
      Sentry.setTag("repository", state.env.repo);
      Sentry.setContext("Repository Data", {
        name: state.env.repo,
      });
    })
    .catch((e) => {
      console.error("Failed to add user data to Sentry configuration");
      console.error(e);
    });
};

export const addSentryPreHandler = (app: express.Express) => {
  if (!useSentry()) {
    return;
  }

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
};

export const addSentryPostHandler = (app: express.Express) => {
  if (!useSentry()) {
    return;
  }

  app.use(Sentry.Handlers.errorHandler());
};

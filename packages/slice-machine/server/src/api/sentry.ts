// We tunnel the Sentry calls via the express server to avoid add blockers
// adapted from https://github.com/getsentry/examples/blob/master/tunneling/nextjs/pages/api/tunnel.js

import * as url from "url";
import express from "express";
import axios from "axios";
import { RequestWithEnv } from "./http/common";
import { nextConfig as sentryNextConfig } from "../../../lib/env/sentry";

const sentryHost = sentryNextConfig.host;
const knownProjectIds = [`/${sentryNextConfig.projectId}`];

// The Sentry client send a POST request with a plaintext body
// Not supported by express by default
export function plainTextBodyParser(
  req: express.Request,
  _: express.Response /* res */,
  next: express.NextFunction
) {
  if (req.is("text/*")) {
    req.body = "";
    req.setEncoding("utf8");
    req.on("data", function (chunk) {
      req.body += chunk;
    });
    req.on("end", next);
  } else {
    next();
  }
}

async function handler(req: RequestWithEnv, res: express.Response) {
  try {
    const envelope = req.body as string;
    const pieces = envelope.split("\n");

    const header = JSON.parse(pieces[0]) as { dsn: string };

    const { host, path } = url.parse(header.dsn);
    if (host !== sentryHost) {
      throw new Error(`invalid host: ${host ?? ""}`);
    }

    const projectId = (path?.endsWith("/") ? path.slice(0, -1) : path) ?? "";
    if (!knownProjectIds.includes(projectId ?? "")) {
      throw new Error(`invalid project id: ${projectId}`);
    }

    const sentryUrl = `https://${sentryHost}/api/${projectId}/envelope/`;
    const response = await axios.post(sentryUrl, envelope);

    return res.status(response.status).send(response.data);
  } catch (e) {
    // TODO add this back when we have the express
    //   captureException(e);
    return res.status(400).json({ status: "invalid request" });
  }
}

export default handler;

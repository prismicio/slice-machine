import express from "express";
const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const mime = require("mime");

import { handler as pushSlice } from "./slices/push";
import saveSlice from "./slices/save";
import { renameSlice } from "./slices/rename";
import createSlice from "./slices/create/index";
import screenshot from "./screenshots/screenshots";
import customScreenshot from "./screenshots/custom-screenshots";
import parseOembed from "./parse-oembed";
import state from "./state";
import checkSimulator from "./simulator";
import saveCustomType from "./custom-types/save";
import renameCustomType from "./custom-types/rename";
import { handler as pushCustomType } from "./custom-types/push";
import startAuth from "./auth/start";
import statusAuth from "./auth/status";
import postAuth from "./auth/post";

import sentryHandler, { plainTextBodyParser } from "./sentry";

import { RequestWithEnv, WithEnv } from "./http/common";
import {
  ScreenshotRequest,
  ScreenshotResponse,
} from "../../../lib/models/common/Screenshots";
import { SaveCustomTypeBody } from "../../../lib/models/common/CustomType";
import { isApiError } from "../../../lib/models/server/ApiResult";
import tracking from "./tracking";

router.use(
  "/__preview",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
  async function previewRoute(req: express.Request, res: express.Response) {
    const p = decodeURIComponent(req.query.q as string);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const stream = fs.createReadStream(p);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const type = mime.getType(p.split(".").pop());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    stream.on("open", function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-argument
      res.set("Content-Type", type);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      stream.pipe(res);
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return stream.on("error", function (e: Error) {
      console.log("[slice-machine] Preview error: ", e);
      res.set("Content-Type", "application/json");
      res.status(404).send({});
    });
  }
);

router.get(
  "/state",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = await state(req);

    return res.status(200).json(payload);
  })
);

router.post(
  "/screenshot",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async function (
    req: express.Request<
      Record<string, never>,
      ScreenshotResponse,
      ScreenshotRequest,
      Record<string, never>
    >,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await screenshot(req.body);
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.post(
  "/custom-screenshot",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-explicit-any
  async function (req: any, res: express.Response): Promise<Express.Response> {
    /* eslint-disable */
    const payload = await customScreenshot(req.files.file, req.body);
    /* eslint-enable */

    return res.status(200).json(payload);
  }
);

router.post(
  "/parse-oembed",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const payload = await parseOembed(req.body.url as string);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

/** Slice Routing **/

router.post(
  "/slices/save",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await saveSlice(req);
    return res.status(200).json(payload);
  })
);

router.post(
  "/slices/create",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await createSlice(req);

    if (isApiError(payload)) {
      return res.status(payload.status).json(payload);
    }

    return res.status(200).json(payload);
  })
);

router.get(
  "/slices/push",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const { statusCode, screenshots } = await pushSlice(req);
    return res.status(statusCode).json(screenshots);
  })
);

router.put(
  "/slices/rename",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await renameSlice(req);
    if (isApiError(payload)) {
      return res.status(payload.status).json(payload);
    }

    return res.status(200).json(payload);
  })
);

/** Custom Type Routing **/

router.post(
  "/custom-types/save",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async function (
    req: express.Request<undefined, undefined, SaveCustomTypeBody>,
    res: express.Response
  ): Promise<Express.Response> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = await saveCustomType(req);
    return res.status(200).json(payload);
  }
);

router.patch(
  "/custom-types/rename",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await renameCustomType(req);

    if (isApiError(payload)) {
      return res.status(payload.status).json(payload);
    }

    return res.status(200).json(payload);
  })
);

router.get(
  "/custom-types/push",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const { statusCode } = await pushCustomType(req);
    return res.sendStatus(statusCode);
  })
);

router.get(
  "/simulator/check",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = await checkSimulator(req);

    return res.status(200).json(payload);
  })
);

router.post(
  "/auth/start",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async function (
    _req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await startAuth();
    if (payload.err) {
      return res.status(500).json({});
    }
    return res.status(200).json({});
  }
);

router.post(
  "/auth/status",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await statusAuth(req);
    if (payload.status === "error") {
      return res.status(500).json(payload);
    }
    return res.status(200).json(payload);
  })
);

// Important route that allows the dashboard to send auth tokens.
router.post(
  "/auth",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = req.body;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const payload = postAuth(req.env.client.apisEndpoints.Wroom, body);
    if (payload.err) {
      console.error(body);
      return res.status(500).json(body);
    }
    return res.status(200).json({});
  })
);

router.post(
  "/s",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises,
  WithEnv(async (req, res): Promise<Express.Response> => {
    return tracking(req)
      .catch(() => null)
      .then(() => res.json());
  })
);

// Sentry Proxy
// eslint-disable-next-line @typescript-eslint/no-misused-promises,
router.post("/sentry", plainTextBodyParser, WithEnv(sentryHandler));

// eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
router.use("*", async function (req: express.Request, res: express.Response) {
  return res.status(404).json({
    err: "not-found",
    reason: `Could not find route "${req.baseUrl}"`,
  });
});

export default router;

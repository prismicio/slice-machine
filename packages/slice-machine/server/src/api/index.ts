import express from "express";
const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const mime = require("mime");

import saveSlice from "./slices/save";
import { renameSlice } from "./slices/rename";
import createSlice from "./slices/create/index";
import saveSliceMock from "./slices/save-mock";
import screenshot from "./screenshots/screenshots";
import customScreenshot from "./screenshots/custom-screenshots";
import parseOembed from "./parse-oembed";
import state from "./state";
import checkSimulator from "./simulator";
import saveCustomType from "./custom-types/save";
import renameCustomType from "./custom-types/rename";
import deleteCustomType from "./custom-types/delete";
import startAuth from "./auth/start";
import statusAuth from "./auth/status";
import postAuth from "./auth/post";
import pushChanges from "./push-changes";

import sentryHandler, { plainTextBodyParser } from "./sentry";

import { RequestWithEnv, withEnv } from "./http/common";
import {
  isError,
  ScreenshotRequest,
  ScreenshotResponse,
} from "../../../lib/models/common/Screenshots";
import { SaveCustomTypeBody } from "../../../lib/models/common/CustomType";
import { isApiError } from "../../../lib/models/server/ApiResult";
import tracking from "./tracking";
import { deleteSlice } from "./slices/delete";
import changelog from "./changelog";

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
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    const payload = await state(req);
    res.status(200).json(payload);
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
    if (isError(payload)) {
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
  withEnv(function (req: RequestWithEnv, res: express.Response) {
    const payload = saveSlice(req);
    res.status(200).json(payload);
  })
);

router.post(
  "/slices/create",
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    const payload = await createSlice(req);

    if (isApiError(payload)) {
      res.status(payload.status).json(payload);
    } else {
      res.status(200).json(payload);
    }
  })
);

router.put(
  "/slices/rename",
  withEnv(function (req: RequestWithEnv, res: express.Response) {
    const payload = renameSlice(req);
    if (isApiError(payload)) {
      res.status(payload.status).json(payload);
    }
    res.status(200).json(payload);
  })
);

router.delete(
  "/slices/delete",
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    const payload = await deleteSlice(req);
    if (isApiError(payload)) {
      res.status(payload.status).json(payload);
    } else {
      res.status(200).json(payload);
    }
  })
);

router.post(
  "/slices/mock",
  withEnv(function (req: RequestWithEnv, res: express.Response) {
    return saveSliceMock(req, res);
  })
);
/** Custom Type Routing **/

router.post(
  "/custom-types/save",
  function (
    req: express.Request<undefined, undefined, SaveCustomTypeBody>,
    res: express.Response
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = saveCustomType(req);
    res.status(200).json(payload);
  }
);

router.patch(
  "/custom-types/rename",
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    const payload = await renameCustomType(req);

    if (isApiError(payload)) {
      res.status(payload.status).json(payload);
    } else {
      res.status(200).json(payload);
    }
  })
);

router.delete(
  "/custom-types/delete",
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    const payload = await deleteCustomType(req);

    if (isApiError(payload)) {
      res.status(payload.status).json(payload);
    } else {
      res.status(200).json(payload);
    }
  })
);

router.post(
  "/push-changes",
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    const result = await pushChanges(req);

    if (isApiError(result)) {
      res.status(result.status).json(result);
    } else {
      res.status(result.status).json(result.body);
    }
  })
);

router.get(
  "/simulator/check",
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = await checkSimulator(req);
    res.status(200).json(payload);
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
  withEnv(async function (req: RequestWithEnv, res: express.Response) {
    const payload = await statusAuth(req);
    if (payload.status === "error") {
      res.status(500).json(payload);
    } else {
      res.status(200).json(payload);
    }
  })
);

// Important route that allows the dashboard to send auth tokens.
router.post(
  "/auth",
  withEnv(function (req: RequestWithEnv, res: express.Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = req.body;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const payload = postAuth(req.env.client.apisEndpoints.Wroom, body);
    if (payload.err) {
      console.error(body);
      res.status(500).json(body);
    } else {
      res.status(200).json({});
    }
  })
);

router.post(
  "/s",
  withEnv((req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tracking(req)
      .catch(() => null)
      .then(() => res.json());
  })
);

// Sentry Proxy
// eslint-disable-next-line @typescript-eslint/no-misused-promises,
router.post("/t", plainTextBodyParser, withEnv(sentryHandler));

router.get(
  "/changelog",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async function (
    _req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await changelog();

    return res.status(200).json(payload);
  }
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
router.use("*", async function (req: express.Request, res: express.Response) {
  return res.status(404).json({
    err: "not-found",
    reason: `Could not find route "${req.baseUrl}"`,
  });
});

export default router;

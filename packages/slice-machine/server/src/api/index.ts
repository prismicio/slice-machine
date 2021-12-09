import express from "express";
const router = express.Router();

const fs = require("fs");
const mime = require("mime");

const pushSlice = require("./slices/push").default;
const saveSlice = require("./slices/save").default;
const createSlice = require("./slices/create/index").default;

const screenshot = require("./screenshots/screenshots").default;
const customScreenshot = require("./screenshots/custom-screenshot").default;
const parseOembed = require("./parse-oembed").default;
const state = require("./state").default;
const trackReview = require("./tracking/review").default;

const saveCustomType = require("./custom-types/save").default;
const pushCustomType = require("./custom-types/push").default;

import validateAuth from "./auth/validate";
import startAuth from "./auth/start";
import statusAuth from "./auth/status";
import postAuth from "./auth/post";
import onboarding from "./tracking/onboarding";
import { RequestWithEnv, WithEnv } from "./http/common";

import {
  TrackingReviewRequest,
  TrackingReviewResponse,
} from "@lib/models/common/TrackingEvent";
import DefaultClient from "@lib/models/common/http/DefaultClient";
import { PrismicSharedConfigManager } from "@slicemachine/core/build/src/filesystem/PrismicSharedConfig";

router.use(
  "/__preview",
  async function previewRoute(req: express.Request, res: express.Response) {
    const p = decodeURIComponent(req.query.q as string);
    const stream = fs.createReadStream(p);
    const type = mime.getType(p.split(".").pop());
    stream.on("open", function () {
      res.set("Content-Type", type);
      stream.pipe(res);
    });
    return stream.on("error", function (e: Error) {
      console.log("[slice-machine] Preview error: ", e);
      res.set("Content-Type", "application/json");
      res.status(404).send({});
    });
  }
);

router.get(
  "/state",
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await state(req);
    if (payload.clientError) {
      return res.status(payload.clientError.status).json(payload);
    }
    return res.status(200).json(payload);
  })
);

router.post(
  "/tracking/review",
  async function (
    req: express.Request<TrackingReviewRequest>,
    res: express.Response<TrackingReviewResponse>
  ): Promise<Express.Response> {
    const payload = await trackReview(req.body);
    return res.status(payload.status).json({});
  }
);

router.post(
  "/tracking/onboarding",
  async (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> => {
    const result = await onboarding(req.body);
    if (result.err) {
      const status = result.err.status || 400;
      return res.status(status).json(result);
    }
    return res.json(result);
  }
);

router.get(
  "/screenshot",
  async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await screenshot(req.query);
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.post(
  "/custom-screenshot",
  async function (req: any, res: express.Response): Promise<Express.Response> {
    const payload = await customScreenshot(req.files.file, req.body);
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.post(
  "/parse-oembed",
  async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await parseOembed(req.body.url);
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

/** Slice Routing **/

router.post(
  "/slices/save",
  async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await saveSlice(req);
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.use(
  "/slices/create",
  async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    let payload;
    if (req.method === "POST") {
      payload = await createSlice(req.body);
    } else {
      payload = await createSlice(req.query);
    }

    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.get(
  "/slices/push",
  async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await pushSlice(req.query);
    if (payload.err) {
      return res.status(payload.status).json(payload);
    }
    return res.status(200).json(payload);
  }
);

/** Custom Type Routing **/

router.post(
  "/custom-types/save",
  async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await saveCustomType(req);
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.get(
  "/custom-types/push",
  WithEnv(async function (
    req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await pushCustomType(req);
    if (payload.err) {
      return res.status(payload.status).json(payload);
    }
    return res.status(200).json(payload);
  })
);

router.get(
  "/auth/validate",
  async function (
    _req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await validateAuth();
    if (payload.err) {
      return res.status(400).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.post(
  "/auth/start",
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
  async function (
    _req: express.Request,
    res: express.Response
  ): Promise<Express.Response> {
    const payload = await statusAuth();
    if (payload.status === "error") {
      return res.status(500).json(payload);
    }
    return res.status(200).json(payload);
  }
);

router.post(
  "/auth",
  WithEnv(async function (
    req: RequestWithEnv,
    res: express.Response
  ): Promise<Express.Response> {
    const body = req.body;

    const payload = postAuth(body);
    if (payload.err) {
      console.error(body);
      return res.status(500).json(body);
    }

    const updatedToken = PrismicSharedConfigManager.getAuth();

    const profile = await DefaultClient.profile(req.env.baseUrl, updatedToken);
    if (profile instanceof Error) return res.status(500).json({});

    PrismicSharedConfigManager.setProperties({ userId: profile.userId });
    req.tracker.resolveUser(profile.userId, req.anonymousId);

    return res.status(200).json({});
  })
);

router.use("*", async function (req: express.Request, res: express.Response) {
  return res.status(404).json({
    err: "not-found",
    reason: `Could not find route "${req.baseUrl}"`,
  });
});

module.exports = router;

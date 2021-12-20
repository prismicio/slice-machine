import express from "express";
import getEnv from "../services/getEnv";
import { BackendEnvironment } from "@lib/models/common/Environment";
import ServerError from "@lib/models/server/ServerError";
import { ServerTracker } from "../services/tracker";

export interface RequestWithEnv extends express.Request {
  tracker?: ServerTracker | undefined;
  anonymousId?: string;
  env: BackendEnvironment;
  errors: Record<string, ServerError>;
}

export function WithEnv(
  handler: (req: RequestWithEnv, res: express.Response) => Promise<any>
) {
  return async function (req: express.Request, res: express.Response) {
    const { env, errors } = await getEnv();
    const anonymousId = req.cookies.ajs_anonymous_id;
    const userId = env.prismicData.userId;
    const identifier = (() => {
      if (userId) return { userId };
      if (anonymousId) return { anonymousId };
      return;
    })();

    const tracker =
      identifier &&
      ServerTracker.build(
        process.env.SEGMENT_WRITE_KEY || "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
        env.repo,
        identifier
      );

    const reqWithEnv = (() => {
      let r = req as any;
      r.env = env;
      r.errors = errors;
      r.tracker = tracker;
      r.anonymousId = anonymousId;
      return r as RequestWithEnv;
    })();
    return handler(reqWithEnv, res);
  };
}

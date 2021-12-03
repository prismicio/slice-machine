import express from "express";
import getEnv from "../services/getEnv";
import Environment from "@lib/models/common/Environment";
import ServerError from "@lib/models/server/ServerError";
import { TrackerBuilder, Tracker } from "../services/tracker";

function stripQuotes(str?: string | undefined): string | undefined {
  if (!str) return;

  return str.slice(1, str.length - 2);
}

export interface RequestWithEnv extends express.Request {
  tracker: Tracker;
  anonymousId?: string;
  env: Environment;
  errors?: { [errorKey: string]: ServerError };
}

export function WithEnv(
  handler: (req: RequestWithEnv, res: express.Response) => Promise<any>
) {
  return async function (req: express.Request, res: express.Response) {
    const { env, errors } = await getEnv();
    const anonymousId = stripQuotes(req.cookies.ajs_anonymous_id);
    const userId = env.prismicData.userId;

    const tracker = new TrackerBuilder(
      process.env.SEGMENT_WRITE_KEY || "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
      env.updateVersionInfo.currentVersion,
      {
        ...(userId ? { userId } : {}),
        ...(!userId && anonymousId ? { anonymousId } : {}),
      },
      env.repo,
      {
        flushAt: 20,
        flushInterval: 300,
      }
    ).build();

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

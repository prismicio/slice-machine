import express from "express";
import getEnv from "../services/getEnv";
import { BackendEnvironment } from "@lib/models/common/Environment";
import ServerError from "@lib/models/server/ServerError";

export interface RequestWithEnv extends express.Request {
  env: BackendEnvironment;
  errors: Record<string, ServerError>;
}

export function WithEnv(
  handler: (req: RequestWithEnv, res: express.Response) => Promise<any>
) {
  return async function (req: express.Request, res: express.Response) {
    const { env, errors } = await getEnv();

    const reqWithEnv = (() => {
      // TODO: this mutates req, so why not assign to req directly ?
      const r = req as any;
      r.env = env;
      r.errors = errors;
      return r as RequestWithEnv;
    })();
    return handler(reqWithEnv, res);
  };
}

import express from "express";
import getEnv from "../services/getEnv";
import { BackendEnvironment } from "@lib/models/common/Environment";
import ServerError from "@lib/models/server/ServerError";

export interface RequestWithEnv extends express.Request {
  env: BackendEnvironment;
  errors: Record<string, ServerError>;
}

export function WithEnv(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: RequestWithEnv, res: express.Response) => Promise<any>
) {
  return async function (req: express.Request, res: express.Response) {
    const { env, errors } = await getEnv();

    const reqWithEnv = (() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      const r = req as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      r.env = env;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      r.errors = errors;
      return r as RequestWithEnv;
    })();
    return handler(reqWithEnv, res);
  };
}

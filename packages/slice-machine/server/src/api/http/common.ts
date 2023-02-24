import type { Request, Response } from "express";

import type { BackendEnvironment } from "../../../../lib/models/common/Environment";
import type ServerError from "../../../../lib/models/server/ServerError";
import getEnv from "../services/getEnv";

export interface RequestWithEnv extends Request {
  env: BackendEnvironment;
  errors: Record<string, ServerError>;
}

export function withEnv(
  handler: (req: RequestWithEnv, res: Response) => Promise<void> | void
): (req: Request, res: Response) => void {
  return (req, res) => {
    const reqWithEnv = req as RequestWithEnv;
    const { env, errors } = getEnv();
    reqWithEnv.env = env;
    reqWithEnv.errors = errors;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handler(reqWithEnv, res);
  };
}

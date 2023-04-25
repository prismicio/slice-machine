import type { ErrorRequestHandler } from "express";
import * as Sentry from "@sentry/node";

import { CreateSliceMachineManagerMiddlewareArgs } from "@slicemachine/manager";

import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

export const node = (name: string, error: unknown): void => {
	if (checkIsSentryEnabled()) {
		Sentry.withScope(function (scope) {
			scope.setTransactionName(name);
			Sentry.captureException(error);
		});
	}
};

export const server: ErrorRequestHandler = (error, req, _res, next): void => {
	node(req.path, error);
	next();
};

export const rpc: CreateSliceMachineManagerMiddlewareArgs["onError"] = (
	args,
) => {
	node(args.procedurePath.join("."), args.error);
};

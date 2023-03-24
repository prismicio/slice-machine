import type { ErrorRequestHandler } from "express";
import * as Sentry from "@sentry/node";

import { CreateSliceMachineManagerMiddlewareArgs } from "@slicemachine/manager";

import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

export const node: ErrorRequestHandler = (error, req, _res, next): void => {
	if (checkIsSentryEnabled()) {
		Sentry.withScope(function (scope) {
			scope.setTransactionName(req.path);
			Sentry.captureException(error);
		});
	}
	next();
};

export const rpc: CreateSliceMachineManagerMiddlewareArgs["onError"] = (
	args,
) => {
	if (checkIsSentryEnabled()) {
		Sentry.withScope(function (scope) {
			scope.setTransactionName(args.procedurePath.join(","));
			Sentry.captureException(args.error);
		});
	}
};

import type { ErrorRequestHandler } from "express";
import * as Sentry from "@sentry/node";

import {
	CreateSliceMachineManagerMiddlewareArgs,
	UnauthenticatedError,
	UnauthorizedError,
} from "@slicemachine/manager";

import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

export const node = (name: string, error: unknown): void => {
	if (checkIsSentryEnabled()) {
		if (
			error instanceof UnauthenticatedError ||
			error instanceof UnauthorizedError
		) {
			// noop - User is not logged in or does not have access to the repository, no need to track this error in Sentry.
		} else {
			Sentry.withScope(function (scope) {
				scope.setTransactionName(name);
				Sentry.captureException(error, {
					...(error instanceof Error ? { extra: { cause: error.cause } } : {}),
				});
			});
		}
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

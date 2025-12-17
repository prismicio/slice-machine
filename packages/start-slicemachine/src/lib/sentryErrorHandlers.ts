import type { ErrorRequestHandler } from "express";
import * as Sentry from "@sentry/node";

import {
	CreateSliceMachineManagerMiddlewareArgs,
	UnauthenticatedError,
	UnauthorizedError,
	InferSliceAbortError,
} from "@slicemachine/manager";

import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

export const node = (name: string, error: unknown): void => {
	if (checkIsSentryEnabled()) {
		if (
			error instanceof UnauthenticatedError ||
			error instanceof UnauthorizedError ||
			error instanceof InferSliceAbortError
		) {
			// noop - No need to track this error in Sentry.
			// 1. User is not logged in or does not have access to the repository
			// 2. Infer slice was aborted by the user, not an error
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

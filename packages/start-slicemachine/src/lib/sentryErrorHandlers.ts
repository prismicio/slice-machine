import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

import * as Sentry from "@sentry/node";

import { H3Event, sendError } from "h3";
import { CreateSliceMachineManagerMiddlewareArgs } from "@slicemachine/manager";

export const h3 = (error: Error, event: H3Event): void => {
	if (checkIsSentryEnabled()) {
		Sentry.withScope(function (scope) {
			scope.setTransactionName(event.path);
			Sentry.captureException(error);
		});

		sendError(event, error);
	}
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

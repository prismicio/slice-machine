import * as Sentry from "@sentry/node";

import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

type ErrorWithCause = Error & {
	cause?: unknown;
};

function hasCause(error: unknown): error is ErrorWithCause {
	return error instanceof Error && "cause" in error;
}

export function trackSentryError(error: unknown): void {
	if (checkIsSentryEnabled()) {
		Sentry.withScope(function (scope) {
			scope.setTransactionName("init");
			Sentry.captureException(error, {
				extra: {
					cause:
						hasCause(error) && error.cause !== undefined
							? (error.cause as string)
							: "",
				},
			});
		});
	}
}

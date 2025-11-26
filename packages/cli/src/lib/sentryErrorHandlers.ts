import * as Sentry from "@sentry/node";

import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

export function trackSentryError(error: unknown): void {
	if (!checkIsSentryEnabled()) {
		return;
	}

	Sentry.captureException(error, {
		...(error instanceof Error ? { extra: { cause: error.cause } } : {}),
	});
}

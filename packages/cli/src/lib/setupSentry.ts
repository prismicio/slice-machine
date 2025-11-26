import * as Sentry from "@sentry/node";
import { getEnvironmentInfo } from "@prismicio/manager";

import { SENTRY_DSN } from "../constants";
import { checkIsSentryEnabled } from "./checkIsSentryEnabled";
import * as pkg from "../../package.json";

export function setupSentry(): void {
	if (!checkIsSentryEnabled()) {
		return;
	}

	const { environment, release } = getEnvironmentInfo(pkg);

	Sentry.init({
		dsn: SENTRY_DSN,
		release,
		environment,
		// Increase the default truncation length of 250 to 2500 (x10)
		// to have enough details in Sentry
		maxValueLength: 2_500,
	});
}

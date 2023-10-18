import * as Sentry from "@sentry/node";
import semver from "semver";

import { SENTRY_EXPRESS_DSN } from "../constants";
import { checkIsSentryEnabled } from "./checkIsSentryEnabled";
import { version } from "../../package.json";

export function setupSentry(): void {
	if (!checkIsSentryEnabled()) {
		return;
	}

	const isStableVersion =
		semver.prerelease(version) === null && semver.lte("0.1.0", version);

	Sentry.init({
		dsn: SENTRY_EXPRESS_DSN,
		release: version,
		environment: isStableVersion
			? import.meta.env.MODE || "production"
			: "alpha",
		// Increase the default truncation length of 250 to 2500 (x10)
		// to have enough details in Sentry
		maxValueLength: 2_500,
	});
}

import * as Sentry from "@sentry/node";
import { PrismicUserProfile } from "@prismicio/manager";

import { SENTRY_DSN } from "../constants";
import * as pkg from "../../package.json";
import { getPackageInfo } from "./package";

/**
 * Checks whether or not Sentry is enabled.
 *
 * Sentry is enabled automatically in production but can be disabled by setting
 * `VITE_ENABLE_SENTRY` to `false`.
 *
 * @returns Whether or not Sentry is enabled.
 */
const checkIsSentryEnabled = (): boolean =>
	import.meta.env.VITE_ENABLE_SENTRY === undefined
		? import.meta.env.PROD
		: import.meta.env.VITE_ENABLE_SENTRY === "true";

export async function trackSentryError(error: unknown): Promise<void> {
	if (!checkIsSentryEnabled()) {
		return;
	}

	Sentry.captureException(error, {
		...(error instanceof Error ? { extra: { cause: error.cause } } : {}),
	});

	// Flush Sentry events before process exits
	await Sentry.flush();
}

export function setupSentry(): void {
	if (!checkIsSentryEnabled()) {
		return;
	}

	const { environment, release } = getPackageInfo(pkg);

	Sentry.init({
		dsn: SENTRY_DSN,
		release,
		environment,
		// Increase the default truncation length of 250 to 2500 (x10)
		// to have enough details in Sentry
		maxValueLength: 2_500,
	});
}

type UpdateSentryContextArgs = {
	repositoryName?: string;
	framework?: string;
	userProfile?: PrismicUserProfile;
};

export async function updateSentryContext({
	repositoryName,
	framework,
	userProfile,
}: UpdateSentryContextArgs): Promise<void> {
	if (!checkIsSentryEnabled()) {
		return;
	}

	if (userProfile) {
		Sentry.setUser({ id: userProfile.shortId });
	}

	if (repositoryName) {
		Sentry.setTag("repository", repositoryName);
		Sentry.setContext("Repository Data", {
			name: repositoryName,
		});
	}

	if (framework) {
		Sentry.setTag("framework", framework);
	}

	Sentry.setContext("Process", {
		"Command used": process.argv.join(" "),
		cwd: process.cwd(),
	});
}

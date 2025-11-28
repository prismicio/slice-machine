import * as Sentry from "@sentry/node";
import {
	PrismicUserProfile,
	PrismicManager,
	getEnvironmentInfo,
} from "@prismicio/manager";

import { SENTRY_DSN } from "../constants";
import * as pkg from "../../package.json";

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

export function trackSentryError(error: unknown): void {
	if (!checkIsSentryEnabled()) {
		return;
	}

	Sentry.captureException(error, {
		...(error instanceof Error ? { extra: { cause: error.cause } } : {}),
	});
}

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

type UpdateSentryContextArgs = {
	manager: PrismicManager;
	repositoryName: string;
	framework: string;
};

export async function updateSentryContext({
	manager,
	repositoryName,
	framework,
}: UpdateSentryContextArgs): Promise<void> {
	if (!checkIsSentryEnabled()) {
		return;
	}

	let userProfile: PrismicUserProfile | undefined;
	try {
		userProfile = await manager.user.getProfile();
	} catch {
		// User is not logged in, it doesn't matter
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

import { PrismicUserProfile } from "@prismicio/manager";
import * as Sentry from "@sentry/node";

import * as pkg from "../../package.json";

import { handleSilentError } from "./error";
import { getPackageInfo } from "./package";

const SENTRY_DSN =
	import.meta.env.VITE_SENTRY_DSN ||
	"https://e1886b1775bd397cd1afc60bfd2ebfc8@o146123.ingest.us.sentry.io/4510445143588864";

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
	try {
		if (!checkIsSentryEnabled()) {
			return;
		}

		Sentry.captureException(error, {
			...(error instanceof Error
				? { extra: { cause: error.cause, fullCommand: process.argv.join(" ") } }
				: {}),
		});

		// Flush Sentry events before process exit
		await Sentry.flush();
	} catch (sentryError) {
		handleSilentError(sentryError, "Sentry tracking error");
	}
}

export function setupSentry(): void {
	try {
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
	} catch (error) {
		handleSilentError(error, "Sentry setup error");
	}
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
	try {
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
	} catch (error) {
		handleSilentError(error, "Sentry context update error");
	}
}

import * as Sentry from "@sentry/node";

import { PrismicUserProfile, PrismicManager } from "@prismicio/manager";
import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

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

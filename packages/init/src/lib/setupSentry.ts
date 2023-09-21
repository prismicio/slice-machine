import * as Sentry from "@sentry/node";
import semver from "semver";

import { PrismicUserProfile, SliceMachineManager } from "@slicemachine/manager";
import { SENTRY_EXPRESS_DSN } from "../constants";
import { checkIsSentryEnabled } from "./checkIsSentryEnabled";
import { version } from "../../package.json";

type SetupSentryArgs = {
	manager: SliceMachineManager;
	repositoryName: string;
	framework: string;
};

export const setupSentry = async ({
	manager,
	repositoryName,
	framework,
}: SetupSentryArgs): Promise<void> => {
	if (!checkIsSentryEnabled()) {
		return;
	}

	let userProfile: PrismicUserProfile | undefined;
	try {
		userProfile = await manager.user.getProfile();
	} catch {
		// User is not logged in, it doesn't matter
	}

	const isStableVersion =
		semver.prerelease(version) === null && semver.lte("0.1.0", version);

	Sentry.init({
		dsn: SENTRY_EXPRESS_DSN,
		release: version,
		environment: isStableVersion
			? import.meta.env.MODE || "production"
			: "alpha",
	});

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
};

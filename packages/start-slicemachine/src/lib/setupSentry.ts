import * as Sentry from "@sentry/node";

import semver from "semver";
import { PrismicUserProfile, SliceMachineManager } from "@slicemachine/manager";
import { SENTRY_EXPRESS_DSN } from "../constants";
import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

export const setupSentry = async (
	manager: SliceMachineManager,
): Promise<void> => {
	if (!checkIsSentryEnabled()) {
		return;
	}

	const sliceMachineVersion =
		await manager.versions.getRunningSliceMachineVersion();

	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	let userProfile: PrismicUserProfile | undefined;
	try {
		userProfile = await manager.user.getProfile();
	} catch {
		// User is not logged in, it doesn't matter
	}

	const isStableVersion =
		semver.prerelease(sliceMachineVersion) === null &&
		semver.lte("0.1.0", sliceMachineVersion);

	Sentry.init({
		dsn: SENTRY_EXPRESS_DSN,
		release: sliceMachineVersion,
		environment: isStableVersion
			? import.meta.env.MODE || "production"
			: "alpha",
		// Increase the default truncation length of 250 to 12500 (x50)
		// to have enough details in Sentry
		maxValueLength: 12_500,
	});
	if (userProfile) {
		Sentry.setUser({ id: userProfile.shortId });
	}
	Sentry.setTag("repository", sliceMachineConfig.repositoryName);
	Sentry.setContext("Repository Data", {
		name: sliceMachineConfig.repositoryName,
	});
};

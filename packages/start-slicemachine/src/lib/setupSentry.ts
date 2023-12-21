import * as Sentry from "@sentry/node";
import {
	PrismicUserProfile,
	SliceMachineManager,
	getEnvironmentInfo,
} from "@slicemachine/manager";

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

	const { environment, release } = getEnvironmentInfo({
		name: "slice-machine-ui",
		version: sliceMachineVersion,
	});

	Sentry.init({
		dsn: SENTRY_EXPRESS_DSN,
		release,
		environment,
		// Increase the default truncation length of 250 to 2500 (x10)
		// to have enough details in Sentry
		maxValueLength: 2_500,
	});
	if (userProfile) {
		Sentry.setUser({ id: userProfile.shortId });
	}
	Sentry.setTag("repository", sliceMachineConfig.repositoryName);
	Sentry.setContext("Repository Data", {
		name: sliceMachineConfig.repositoryName,
	});
};

import * as Sentry from "@sentry/node";

import semver from "semver";
import { App, H3Event, sendError } from "h3";
import {
	CreateSliceMachineManagerMiddlewareArgs,
	PrismicUserProfile,
	SliceMachineManager,
} from "@slicemachine/manager";
import { SENTRY_EXPRESS_DSN } from "../constants";

export const setupSentry = async (
	manager: SliceMachineManager,
	app: App,
): Promise<void> => {
	if (!isSentryEnabled()) {
		return;
	}

	const sliceMachineVersion =
		await manager.versions.getRunningSliceMachineVersion();

	let userProfile: PrismicUserProfile | undefined;
	try {
		userProfile = await manager.user.getProfile();
	} catch {
		// not logged in
		// userProfile stays undefined
	}

	const config = await manager.project.getSliceMachineConfig();

	const isStableVersion =
		/^\d+\.\d+\.\d+$/.test(sliceMachineVersion) &&
		semver.lte("0.1.0", sliceMachineVersion);

	Sentry.init({
		dsn: process.env.SENTRY_EXPRESS_DSN ?? SENTRY_EXPRESS_DSN,
		release: sliceMachineVersion,
		environment: isStableVersion
			? process.env.NODE_ENV ?? "production"
			: "alpha",
	});

	if (userProfile !== undefined) {
		Sentry.setUser({ id: userProfile.shortId });
	}
	Sentry.setTag("repository", config.repositoryName);
	Sentry.setContext("Repository Data", {
		name: config.repositoryName,
	});

	app.options.onError = onH3Error;
};

// We want Sentry enabled
// - automatically in production (not dev or test)
// - or if explicitely set in the environment
const isSentryEnabled = (): boolean =>
	!["development", "test"].includes(process.env.NODE_ENV ?? "") ||
	process.env.SENTRY_AUTH_TOKEN !== undefined;

const onH3Error = (error: Error, event: H3Event): void => {
	Sentry.withScope(function (scope) {
		scope.setTransactionName(event.path);
		Sentry.captureException(error);
	});

	sendError(event, error);
};

export const onRPCError: CreateSliceMachineManagerMiddlewareArgs["onError"] = (
	args,
) => {
	if (isSentryEnabled()) {
		Sentry.withScope(function (scope) {
			scope.setTransactionName(args.procedurePath.join(","));
			Sentry.captureException(args.error);
		});
	}
};

import * as Sentry from "@sentry/node";

import semver from "semver";
import { App, H3Event, sendError } from "h3";
import { SliceMachineManager } from "@slicemachine/manager";
import { SENTRY_EXPRESS_DSN } from "../constants";

export const setupSentry = async (
	manager: SliceMachineManager,
	app: App,
): Promise<void> => {
	!isDevEnv() || process.env.SENTRY_AUTH_TOKEN !== undefined;
	if (!isSentryEnabled()) {
		return;
	}

	const sliceMachineVersion =
		await manager.versions.getRunningSliceMachineVersion();

	let user;
	try {
		user = await manager.user.getProfile();
	} catch {
		// not logged in
		// user stays undefined
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

	Sentry.setUser({ id: user?.shortId });
	Sentry.setTag("repository", config.repositoryName);
	Sentry.setContext("Repository Data", {
		name: config.repositoryName,
	});

	app.options.onError = onError;
};

const isDevEnv = () =>
	["development", "test"].includes(process.env.NODE_ENV ?? "");

// We want Sentry enabled
// - automatically in production (not dev or test)
// - or if explicitely set in the environment
const isSentryEnabled = (): boolean =>
	!isDevEnv() || process.env.SENTRY_AUTH_TOKEN !== undefined;

const onError = (error: Error, event: H3Event): void => {
	if (isSentryEnabled()) {
		Sentry.withScope(function (scope) {
			// TODO: we need the `procedurePath` fron payload here
			scope.setTransactionName(event.path);
			Sentry.captureException(error);
		});
	}

	sendError(event, error);
};

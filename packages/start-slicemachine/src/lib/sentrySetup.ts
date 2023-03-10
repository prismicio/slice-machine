import * as Sentry from "@sentry/node";
import { SliceMachineManager } from "@slicemachine/manager/*";

import semver from "semver";
import { H3Event, sendError } from "h3";

// TODO disable this in dev, or set env in dev
// Could become "isProd() || enableSentry()"
export const enableSentry = (): boolean => !process.env.NO_SENTRY;

export const initSentry = async (
	manager: SliceMachineManager,
): Promise<void> => {
	if (!enableSentry()) {
		return;
	}

	const version = await manager.versions.getRunningSliceMachineVersion();
	let userId: string | undefined;
	try {
		const user = await manager.getPrismicAuthManager().getProfile();
		userId = user.shortId;
	} catch {
		userId = undefined;
	}

	const config = await manager.project.getSliceMachineConfig();

	const isStableVersion =
		/^\d+\.\d+\.\d+$/.test(version) && semver.lte("0.1.0", version);

	Sentry.init({
		dsn:
			process.env.SENTRY_EXPRESS_DSN ??
			"https://b673ba8b041d4449a0fb0a38691882dd@o146123.ingest.sentry.io/4504179268845568",
		release: version,
		environment: isStableVersion ? process.env.NODE_ENV : "alpha",
	});

	Sentry.setUser({ id: userId });
	Sentry.setTag("repository", config.repositoryName);
	Sentry.setContext("Repository Data", {
		name: config.repositoryName,
	});
};

export const onError = (error: Error, event: H3Event): void => {
	if (enableSentry()) {
		Sentry.withScope(function (scope) {
			// TODO: we need the `procedurePath` fron payload here
			scope.setTransactionName(event.path);
			Sentry.captureException(error);
		});
	}

	sendError(event, error);
};

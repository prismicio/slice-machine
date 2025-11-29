import type { PrismicManager } from "@prismicio/manager";

import { name as pkgName, version as pkgVersion } from "../../package.json";

import { handleSilentError } from "./error";

type InitTelemetryArgs = {
	manager: PrismicManager;
	commandType: "init" | "sync";
	repositoryName?: string;
};

export async function initTelemetry(args: InitTelemetryArgs): Promise<void> {
	const { manager, commandType, repositoryName } = args;

	await manager.telemetry.initTelemetry({
		appName: pkgName,
		appVersion: pkgVersion,
	});

	// Get repository name from project config if not provided
	let resolvedRepositoryName = repositoryName;
	if (!resolvedRepositoryName) {
		resolvedRepositoryName = await manager.project.getRepositoryName();
	}

	await manager.telemetry.track({
		event: "prismic-cli:start",
		repository: resolvedRepositoryName,
		commandType,
		fullCommand: process.argv.join(" "),
	});
}

type TrackErrorTelemetryArgs = {
	manager: PrismicManager;
	error: unknown;
	commandType: "init" | "sync";
};

export async function trackErrorTelemetry(
	args: TrackErrorTelemetryArgs,
): Promise<void> {
	const { manager, error, commandType } = args;

	// Transform error to string and prevent hitting Segment 500kb API limit
	const safeError = (error instanceof Error ? error.message : `${error}`).slice(
		0,
		512,
	);

	let repositoryName;
	try {
		repositoryName = await manager.project.getRepositoryName();
	} catch (error) {
		handleSilentError(
			error,
			"Telemetry track error while getting repository name",
		);
	}

	await manager.telemetry.track({
		event: "prismic-cli:end",
		commandType,
		repository: repositoryName,
		fullCommand: process.argv.join(" "),
		success: false,
		error: safeError,
	});
}

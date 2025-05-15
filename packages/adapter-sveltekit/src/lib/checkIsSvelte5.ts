import { SliceMachineContext } from "@slicemachine/plugin-kit";
import { readProjectFile } from "@slicemachine/plugin-kit/fs";
import semver from "semver";

import { PluginOptions } from "../types";

export const checkIsSvelte5 = (args: CheckIsSvelteNArgs): Promise<boolean> => {
	return checkIsSvelteN(5, args);
};

type CheckIsSvelteNArgs = {
	helpers: SliceMachineContext<PluginOptions>["helpers"];
};

const checkIsSvelteN = async (
	version: number,
	args: CheckIsSvelteNArgs,
): Promise<boolean> => {
	try {
		const packageJsonContent = await readProjectFile({
			filename: "package.json",
			encoding: "utf8",
			helpers: args.helpers,
		});

		const packageJson = JSON.parse(packageJsonContent);
		const allDependencies: Record<string, string> = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};
		const svelteVersion = allDependencies.svelte;

		// Assume version doesn't match when no version is found or on special cases.
		if (
			!svelteVersion ||
			["latest", "next", "beta", "alpha", "dev", "*"].includes(svelteVersion)
		) {
			return false;
		}

		// Try to get the minimum version.
		const minVersion = semver.minVersion(svelteVersion) ?? svelteVersion;

		// Check if the version is a match.
		return semver.major(minVersion) === version;
	} catch (error) {
		return false;
	}
};

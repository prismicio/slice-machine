import semver from "semver";
import _module, { createRequire } from "node:module";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";

type CheckProjectDependencyMatchArgs = {
	dependency: string;
	semverRange: string;
	helpers: SliceMachineHelpers;
};

export const checkProjectDependencyMatch = async (
	args: CheckProjectDependencyMatchArgs,
): Promise<boolean> => {
	let packageJSON: {
		version?: string;
	};

	try {
		const noop = args.helpers.joinPathFromRoot("noop.js");

		let resolvedID = `${args.dependency}/package.json`;

		// Support Yarn PnP
		if (
			process.versions.pnp &&
			"findPnpApi" in _module &&
			typeof _module.findPnpApi === "function"
		) {
			const pnpApi = _module.findPnpApi(noop);
			if (pnpApi) {
				resolvedID = pnpApi.resolveRequest(resolvedID, noop);
			}
		}

		packageJSON = await createRequire(noop)(resolvedID);
	} catch (error) {
		console.error(error);

		return false;
	}

	if (!packageJSON.version) {
		return false;
	}

	return (
		Boolean(semver.valid(packageJSON.version)) &&
		semver.satisfies(packageJSON.version, args.semverRange)
	);
};

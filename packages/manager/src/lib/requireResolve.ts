import _module, { createRequire } from "node:module";

/**
 * Resolves a module path with `createRequire().resolve()` with Yarn PnP
 * support.
 *
 * @param id - Module to resolve.
 * @param from - Location to resolve the module from.
 *
 * @returns - Resolved module path.
 */
export const requireResolve = (id: string, from: string): string => {
	let resolvedID = id;

	// Support Yarn PnP
	if (
		process.versions.pnp &&
		"findPnpApi" in _module &&
		typeof _module.findPnpApi === "function"
	) {
		const pnpApi = _module.findPnpApi(from);
		if (pnpApi) {
			resolvedID = pnpApi.resolveRequest(id, from);
		}
	}

	const require = createRequire(from);

	return require.resolve(resolvedID);
};

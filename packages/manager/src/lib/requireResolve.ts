import _module from "node:module";

/**
 * Resolves a module path with `createRequire().resolve()` with Yarn PnP
 * support.
 *
 * @param id - Module to resolve.
 * @param from - Location to resolve the module from.
 *
 * @returns - Resolved module path.
 */
export default (id: string, from: string): string => {
	let _id = id;

	// Support Yarn PnP
	if (
		process.versions.pnp &&
		"findPnpApi" in _module &&
		_module.findPnpApi instanceof Function
	) {
		const pnpApi = _module.findPnpApi(from);
		if (pnpApi) {
			_id = pnpApi.resolveRequest(id, from);
		}
	}

	const require = _module.createRequire(from);

	return require.resolve(_id);
};

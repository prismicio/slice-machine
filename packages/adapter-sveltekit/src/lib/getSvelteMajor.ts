import { requireResolve } from "./requireResolve";

export const getSvelteMajor = async (): Promise<number> => {
	// A dynamic import lets us easily mock the module.
	const { readFile } = await import("node:fs/promises");

	const packageJSONPath = requireResolve("svelte/package.json", process.cwd());
	const { version } = JSON.parse(await readFile(packageJSONPath, "utf8"));

	const major = Number.parseInt(version.split(".")[0]);
	if (major === Number.NaN) {
		throw new Error(
			`Unable to parse svelte's installed version number: "${version}"`,
		);
	}

	return major;
};

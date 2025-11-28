import { join } from "node:path";

import { requireResolve } from "./requireResolve";

export const getSvelteMajor = async (): Promise<number> => {
	// A dynamic import lets us easily mock the module.
	const { readFile } = await import("node:fs/promises");

	const packageJSONPath = requireResolve(
		"svelte/package.json",
		join(process.cwd(), "package.json"),
	);
	const { version } = JSON.parse(await readFile(packageJSONPath, "utf8"));

	const major = Number.parseInt(version.split(".")[0]);
	if (Number.isNaN(major)) {
		throw new Error(
			`Unable to parse svelte's installed version number: "${version}"`,
		);
	}

	return major;
};

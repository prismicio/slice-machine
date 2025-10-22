import { join } from "node:path";

import { requireResolve } from "./requireResolve";

export const getNextJSVersion = async (): Promise<string> => {
	// A dynamic import lets us easily mock the module.
	const { readFile } = await import("node:fs/promises");

	const packageJSONPath = requireResolve(
		"next/package.json",
		join(process.cwd(), "package.json"),
	);
	const { version } = JSON.parse(await readFile(packageJSONPath, "utf8"));

	return version;
};

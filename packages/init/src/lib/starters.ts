import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { StarterId } from "@slicemachine/manager";

const STARTERS_REPOSITORY_NAME_TO_ID: Record<string, StarterId> = {
	"nextjs-starter-prismic-minimal": "next_minimal",
	"nextjs-starter-prismic-minimal-ts": "next_minimal",
	"nextjs-starter-prismic-multi-page": "next_multi_page",
	"nuxt-starter-prismic-minimal": "nuxt_minimal",
	"nuxt-starter-prismic-multi-page": "nuxt_multi_page",
	"sveltekit-starter-prismic-minimal": "sveltekit_minimal",
	"sveltekit-starter-prismic-multi-page": "sveltekit_multi_page",
};

export const detectStarterId = async (
	cwd: string,
): Promise<StarterId | undefined> => {
	const path = join(cwd, "package.json");

	try {
		const pkg = JSON.parse(await readFile(path, "utf-8"));

		return STARTERS_REPOSITORY_NAME_TO_ID[pkg.name];
	} catch (error) {
		throw new Error(
			`Failed to read project's \`package.json\` at \`${path}\``,
			{ cause: error },
		);
	}
};

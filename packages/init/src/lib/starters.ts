import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { StarterID } from "@slicemachine/manager";

const STARTERS_REPOSITORY_NAME_TO_ID: Record<string, StarterID> = {
	"nextjs-starter-prismic-multi-page": "next_multi_page",
	"nextjs-starter-prismic-blog": "next_blog",
	"nextjs-starter-prismic-multi-language": "next_multi_lang",
	"nuxt-starter-prismic-multi-page": "nuxt_multi_page",
	"nuxt-starter-prismic-blog": "nuxt_blog",
	"nuxt-starter-prismic-multi-language": "nuxt_multi_lang",
};

export const detectStarterId = async (
	cwd: string,
): Promise<StarterID | undefined> => {
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

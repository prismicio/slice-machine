import { source } from "common-tags";

import type { DocumentationReadHook } from "@slicemachine/plugin-kit";

import { getJSFileExtension } from "../lib/getJSFileExtension";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";

import type { PluginOptions } from "../types";
import {
	componentFileTemplate,
	dataFileTemplate,
} from "./documentation-read.templates";

const nestRouteFilePath = (filePath: string, nesting: string): string => {
	return [
		...filePath.split("/").slice(0, 2),
		nesting,
		...filePath.split("/").slice(2),
	].join("/");
};

export const documentationRead: DocumentationReadHook<PluginOptions> = async (
	data,
	{ options, helpers },
) => {
	if (data.kind === "PageSnippet") {
		const { model } = data.data;

		const pageDataExtension = await getJSFileExtension({ helpers, options });
		const typescript = await checkIsTypeScriptProject({ options, helpers });

		const routePath = `src/routes/${model.repeatable ? "[uid]" : model.id}`;
		const dataFilePath = `${routePath}/+page.server.${pageDataExtension}`;
		const componentFilePath = `${routePath}/+page.svelte`;

		let dataFileContent = dataFileTemplate({ model, typescript });
		if (options.format) {
			dataFileContent = await helpers.format(
				dataFileContent,
				helpers.joinPathFromRoot(dataFilePath),
				{
					includeNewlineAtEnd: false,
				},
			);
		}

		let componentFileContent = componentFileTemplate({ typescript });
		if (options.format) {
			componentFileContent = await helpers.format(
				componentFileContent,
				helpers.joinPathFromRoot(componentFilePath),
				{
					prettier: {
						plugins: ["prettier-plugin-svelte"],
						parser: "svelte",
					},
					includeNewlineAtEnd: false,
				},
			);
		}

		const nestedDataFilePath = nestRouteFilePath(dataFilePath, "marketing");
		const nestedComponentFilePath = nestRouteFilePath(
			componentFilePath,
			"marketing",
		);

		return [
			{
				label: "Default",
				content: source`
					## Create your ${model.label}'s page data fetcher

					Add a new route by creating a \`${dataFilePath}\` file. (If the route should be nested in a child directory, you can create the file in a directory, like \`${nestedDataFilePath}\`.)

					Paste in this code:

					${`~~~${pageDataExtension} [${dataFilePath}]\n${dataFileContent}\n~~~`}

					## Create your ${model.label}'s page component

					In the route's directory, create a \`${componentFilePath}\` file. (If the route should be nested in a child directory, you can create the file in a directory, like \`${nestedComponentFilePath}\`.)

					Paste in this code:

					${`~~~svelte [${componentFilePath}]\n${componentFileContent}\n~~~`}

					Make sure all of your import paths are correct. See the [install guide](https://prismic.io/docs/svelte-install) for more information.
				`,
			},
		];
	}

	return [];
};

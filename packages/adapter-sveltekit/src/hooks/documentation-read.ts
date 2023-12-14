import { source } from "common-tags";

import type { DocumentationReadHook } from "@slicemachine/plugin-kit";

import { getJSFileExtension } from "../lib/getJSFileExtension";

import type { PluginOptions } from "../types";

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

		const routePath = `src/routes/${model.repeatable ? "[uid]" : model.id}`;
		const dataFilePath = `${routePath}/+page.server.${pageDataExtension}`;
		const componentFilePath = `${routePath}/+page.svelte`;

		let dataFileContent: string;
		if (model.repeatable) {
			dataFileContent = source`
				import { createClient } from "$lib/prismicio";

				export async function load({ params, fetch, cookies }) {
					const client = createClient({ fetch, cookies });

					const page = await client.getByUID("${model.id}", params.uid);

					return {
						page,
					};
				}

				export async function entries() {
					const client = createClient();

					const pages = await client.getAllByType("${model.id}");

					return pages.map((page) => {
						return { uid: page.uid };
					});
				}
			`;
		} else {
			dataFileContent = source`
				import { createClient } from "$lib/prismicio";

				export async function load({ params, fetch, cookies }) {
					const client = createClient({ fetch, cookies });

					const page = await client.getSingle("${model.id}");

					return {
						page,
					};
				}

				export async function entries() {
					return [{}]
				}
			`;
		}

		let componentFileContent = source`
			<script>
				import { SliceZone } from "@prismicio/svelte";

				import { components } from "$lib/slices";

				export let data;
			</script>

			<SliceZone slices={data.page.data.slices} {components} />
		`;

		if (options.format) {
			dataFileContent = await helpers.format(
				dataFileContent,
				helpers.joinPathFromRoot(dataFilePath),
				{
					includeNewlineAtEnd: false,
				},
			);
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

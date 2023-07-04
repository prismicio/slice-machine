import { source, stripIndent } from "common-tags";

import type { DocumentationReadHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

export const documentationRead: DocumentationReadHook<PluginOptions> = async (
	data,
	{ options, helpers },
) => {
	if (data.kind === "PageSnippet") {
		const { model } = data.data;
		const filePath = `~/pages/${model.repeatable ? "_uid" : model.id}.vue`;

		let fileContent: string;

		if (model.repeatable) {
			fileContent = stripIndent`
				<template>
					<SliceZone :slices="page.data.slices" :components="components" />
				</template>

				<script>
				import { components } from "~/slices";

				export default {
					async asyncData({ $prismic, params }) {
						const page = await $prismic.api.getByUID("${model.id}", params.uid);

						return { page };
					},
					data() {
						return { components };
					},
				};
				</script>
			`;
		} else {
			fileContent = stripIndent`
				<template>
					<SliceZone :slices="page.data.slices" :components="components" />
				</template>

				<script>
				import { components } from "~/slices";

				export default {
					async asyncData({ $prismic }) {
						const page = await $prismic.api.getSingle("${model.id}");

						return { page };
					},
					data() {
						return { components };
					},
				};
				</script>
			`;
		}

		if (options.format) {
			fileContent = await helpers.format(
				fileContent,
				helpers.joinPathFromRoot("index.vue"),
				{
					prettier: { parser: "vue" },
					includeNewlineAtEnd: false,
				},
			);
		}

		return [
			{
				label: "Options API",
				content: source`
					## Creating ${model.label}'s page

					To render **${
						model.label
					}**, create a new page in Nuxt's [pages directory](https://v2.nuxt.com/docs/directory-structure/pages) (e.g. \`${filePath}\`), with the following content.

					${`~~~vue [${filePath}]\n${fileContent}\n~~~`}

					> For more information about fetching content from Prismic, checkout the [fetching data documentation](https://prismic.io/docs/nuxt-fetch-data).
				`,
			},
		];
	}

	return [];
};

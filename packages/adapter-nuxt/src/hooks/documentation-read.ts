import { source, stripIndent } from "common-tags";

import type { DocumentationReadHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";

export const documentationRead: DocumentationReadHook<PluginOptions> = async (
	data,
	{ options, helpers },
) => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	if (data.kind === "PageSnippet") {
		const { model } = data.data;
		const filePath = `~/pages/${model.repeatable ? "[uid]" : model.id}.vue`;
		const scriptAttributes = ["setup"];
		if (isTypeScriptProject) {
			scriptAttributes.push('lang="ts"');
		}

		let fileContent: string;

		if (model.repeatable) {
			fileContent = stripIndent`
				<script ${scriptAttributes.join(" ")}>
				import { components } from "~/slices";

				const prismic = usePrismic();
				const route = useRoute();
				const { data: page } = useAsyncData("[${model.id}-uid]", () =>
					prismic.client.getByUID("${model.id}", route.params.uid${
				isTypeScriptProject ? " as string" : ""
			})
				);
				</script>

				<template>
					<SliceZone
						wrapper="main"
						:slices="page?.data.slices ?? []"
						:components="components"
					/>
				</template>
			`;
		} else {
			fileContent = stripIndent`
				<script ${scriptAttributes.join(" ")}>
					import { components } from "~/slices";

					const prismic = usePrismic();
					const { data: page } = useAsyncData("[${model.id}]", () =>
						prismic.client.getSingle("${model.id}")
					);
				</script>

				<template>
					<SliceZone
						wrapper="main"
						:slices="page?.data.slices ?? []"
						:components="components"
					/>
				</template>
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
				label: "Composition API",
				content: source`
					## Creating ${model.label}'s page

					To render **${
						model.label
					}**, create a new page in Nuxt's [pages directory](https://nuxt.com/docs/guide/directory-structure/pages) (e.g. \`${filePath}\`), with the following content.

					${`~~~vue [${filePath}]\n${fileContent}\n~~~`}

					> For more information about fetching content from Prismic, checkout the [fetching data documentation](https://prismic.io/docs/nuxt-3-fetch-data).
				`,
			},
		];
	}

	return [];
};

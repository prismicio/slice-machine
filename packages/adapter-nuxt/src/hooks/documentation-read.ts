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
		const filePath = `${model.repeatable ? "[uid]" : model.id}.vue`;
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
				const { data: page } = useAsyncData(\`[${
					model.id
				}-uid-\${route.params.uid}]\`, () =>
					prismic.client.getByUID("${model.id}", route.params.uid${
						isTypeScriptProject ? " as string" : ""
					})
				);

				useHead({
					title: page.value?.data.meta_title,
					meta: [{
						name: "description",
						content: page.value?.data.meta_description,
					}],
				});
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

					useHead({
						title: page.value?.data.meta_title,
						meta: [{
							name: "description",
							content: page.value?.data.meta_description,
						}],
					});
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
					## Create your ${model.label}'s page component

					Add a new route by creating an \`~/pages/${filePath}\` file. (If the route should be nested in a child directory, you can create the file in a directory, like \`~/pages/marketing/${filePath}\`.)

					Paste in this code:

					${`~~~vue [~/pages/${filePath}]\n${fileContent}\n~~~`}

					Make sure all of your import paths are correct. See the [install guide](https://prismic.io/docs/nuxt-3-setup) for more information.
				`,
			},
		];
	}

	return [];
};

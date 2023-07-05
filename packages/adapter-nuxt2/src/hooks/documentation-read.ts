import { source, stripIndent } from "common-tags";

import type { DocumentationReadHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

export const documentationRead: DocumentationReadHook<PluginOptions> = async (
	data,
	{ options, helpers },
) => {
	if (data.kind === "PageSnippet") {
		const { model } = data.data;
		const filePath = `${model.repeatable ? "_uid" : model.id}.vue`;

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
					head() {
						return {
							title: this.page.data.meta_title,
							meta: [{
								hid: "description",
								name: "description",
								content: this.page.data.meta_description,
							}],
						};
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
					head() {
						return {
							title: this.page.data.meta_title,
							meta: [{
								hid: "description",
								name: "description",
								content: this.page.data.meta_description,
							}],
						};
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
					## Create your ${model.label}'s page component

					Add a new route by creating an \`~/pages/${filePath}\` file. (If the route should be nested in a child directory, you can create the file in a directory, like \`~/pages/marketing/${filePath}\`.)

					Paste in this code:

					${`~~~vue [~/pages/${filePath}]\n${fileContent}\n~~~`}

					Make sure all of your import paths are correct. See the [install guide](https://prismic.io/docs/nuxt-setup) for more information.
				`,
			},
		];
	}

	return [];
};

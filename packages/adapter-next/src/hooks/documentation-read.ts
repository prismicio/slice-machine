import { stripIndent, source } from "common-tags";

import type { DocumentationReadHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getJSFileExtension } from "../lib/getJSFileExtension";

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
		const extension = await getJSFileExtension({ helpers, options, jsx: true });

		const appFilePath = `~/app/${
			model.repeatable ? "[uid]" : model.id
		}/page.${extension}`;
		const pagesFilePath = `~/pages/${
			model.repeatable ? "[uid]" : model.id
		}.${extension}`;

		let appFileContent: string;
		let pagesFileContent: string;
		if (isTypeScriptProject) {
			if (model.repeatable) {
				appFileContent = stripIndent`
					import { notFound } from "next/navigation";
					import { asText } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default async function Page({ params }: { params: { uid: string } }) {
						const client = createClient();
						const page = await client.getByUID("${model.id}", params.uid).catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}
				`;
				pagesFileContent = stripIndent`
					import type { InferGetStaticPropsType, GetStaticPropsContext } from "next";
					import { SliceZone } from "@prismicio/react";
					import { asLink } from "@prismicio/client";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
					type PageParams = { uid: string };

					export default function Page({ page }: PageProps) {
						return (
							<main>
								<SliceZone slices={page.data.slices} components={components} />
							</main>
						);
					};

					export async function getStaticProps({
						params,
						previewData
					}: GetStaticPropsContext<PageParams>) {
						const client = createClient({ previewData });

						if (params && params.uid) {
							const page = await client.getByUID("${model.id}", params.uid);

							if (page) {
								return {
									props: {
										page,
									},
								};
							}
						}

						return {
							notFound: true,
						}
					};

					export async function getStaticPaths() {
						const client = createClient();

						/**
						 * Query all Documents from the API.
						 */
						const pages = await client.getAllByType("${model.id}");

						/**
						 * Define a path for every Document.
						 */
						return {
							paths: pages.map((page) => {
								return asLink(page);
							}),
							fallback: false,
						};
					};
				`;
			} else {
				appFileContent = stripIndent`
					import { notFound } from "next/navigation";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default async function Page() {
						const client = createClient();
						const page = await client.getSingle("${model.id}").catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}
				`;
				pagesFileContent = stripIndent`
					import type { InferGetStaticPropsType, GetStaticPropsContext } from "next";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

					export default function Page({ page }: PageProps) {
						return (
							<main>
								<SliceZone slices={page.data.slices} components={components} />
							</main>
						);
					};

					export async function getStaticProps({ previewData }: GetStaticPropsContext) {
						const client = createClient({ previewData });

						const page = await client.getSingle("${model.id}");

						return {
							props: {
								page,
							},
						};
					};
				`;
			}
		} else {
			if (model.repeatable) {
				appFileContent = stripIndent`
					import { notFound } from "next/navigation";
					import { asText } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default async function Page({ params }) {
						const client = createClient();
						const page = await client.getByUID("${model.id}", params.uid).catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}
				`;
				pagesFileContent = stripIndent`
					import { SliceZone } from "@prismicio/react";
					import { asLink } from "@prismicio/client";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default function Page({ page }) {
						return (
							<main>
								<SliceZone slices={page.data.slices} components={components} />
							</main>
						);
					};

					export async function getStaticProps({ params, previewData }) {
						const client = createClient({ previewData });

						const page = await client.getByUID("${model.id}", params.uid);

						return {
							props: {
								page,
							},
						};
					};

					export async function getStaticPaths() {
						const client = createClient();

						/**
						 * Query all Documents from the API.
						 */
						const pages = await client.getAllByType("${model.id}");

						/**
						 * Define a path for every Document.
						 */
						return {
							paths: pages.map((page) => {
								return asLink(page);
							}),
							fallback: false,
						};
					};
				`;
			} else {
				appFileContent = stripIndent`
					import { notFound } from "next/navigation";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default async function Page() {
						const client = createClient();
						const page = await client.getSingle("${model.id}").catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}
				`;
				pagesFileContent = stripIndent`
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default function Page({ page }) {
						return (
							<main>
								<SliceZone slices={page.data.slices} components={components} />
							</main>
						);
					};

					export async function getStaticProps({ previewData }) {
						const client = createClient({ previewData });

						const page = await client.getSingle("${model.id}");

						return {
							props: {
								page,
							},
						};
					};
				`;
			}
		}

		if (options.format) {
			appFileContent = await helpers.format(
				appFileContent,
				helpers.joinPathFromRoot(`index.${extension}`),
				{
					includeNewlineAtEnd: false,
				},
			);
			pagesFileContent = await helpers.format(
				pagesFileContent,
				helpers.joinPathFromRoot(`index.${extension}`),
				{
					includeNewlineAtEnd: false,
				},
			);
		}

		return [
			{
				label: "App Router",
				content: source`
					## Creating ${model.label}'s page

					To render **${
						model.label
					}**, create a new page in Next's [app directory](https://nextjs.org/docs/app/building-your-application/routing) (e.g. \`${appFilePath}\`), with the following content.

					${`~~~${extension} [${appFilePath}]\n${appFileContent}\n~~~`}

					> For more information about fetching content from Prismic, checkout the [fetching data documentation](https://prismic.io/docs/fetch-data-nextjs).
				`,
			},
			{
				label: "Page Router",
				content: source`
					## Creating ${model.label}'s page

					To render **${
						model.label
					}**, create a new page in Next's [pages directory](https://nextjs.org/docs/pages/building-your-application/routing) (e.g. \`${pagesFilePath}\`), with the following content.

					${`~~~${extension} [${pagesFilePath}]\n${pagesFileContent}\n~~~`}

					> For more information about fetching content from Prismic, checkout the [fetching data documentation](https://prismic.io/docs/fetch-data-nextjs).
				`,
			},
		];
	}

	return [];
};

import { source } from "common-tags";

import type { DocumentationReadHook } from "@slicemachine/plugin-kit";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getJSFileExtension } from "../lib/getJSFileExtension";

import type { PluginOptions } from "../types";

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

		let appFilePath;
		let pagesFilePath;

		if (!model.repeatable && model.id === "homepage") {
			appFilePath = `page.${extension}`;
			pagesFilePath = `index.${extension}`;
		} else if (model.repeatable) {
			appFilePath = `[uid]/page.${extension}`;
			pagesFilePath = `[uid].${extension}`;
		} else {
			appFilePath = `${model.id}/page.${extension}`;
			pagesFilePath = `${model.id}.${extension}`;
		}

		let appFileContent: string;
		let pagesFileContent: string;
		if (isTypeScriptProject) {
			if (model.repeatable) {
				appFileContent = source`
					import { Metadata } from "next";
					import { notFound } from "next/navigation";
					import { asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					type Params = { uid: string };

					export default async function Page({ params }: { params: Promise<Params> }) {
						const { uid } = await params;
						const client = createClient();
						const page = await client.getByUID("${model.id}", uid).catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}

					export async function generateMetadata({
						params,
					}: {
						params: Promise<Params>;
					}): Promise<Metadata> {
						const { uid } = await params;
						const client = createClient();
						const page = await client.getByUID("${model.id}", uid).catch(() => notFound());

						return {
							title: page.data.meta_title,
							description: page.data.meta_description,
							openGraph: {
								images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
							},
						};
					}

					export async function generateStaticParams() {
						const client = createClient();
						const pages = await client.getAllByType("${model.id}");

						return pages.map((page) => ({ uid: page.uid }));
					}
				`;
				pagesFileContent = source`
					import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
					import Head from "next/head";
					import { isFilled, asLink, asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { components } from "@/slices";
					import { createClient } from "@/prismicio";

					type Params = { uid: string };

					export default function Page({
						page,
					}: InferGetStaticPropsType<typeof getStaticProps>) {
						return (
							<>
								<Head>
									<title>{page.data.meta_title}</title>
									{isFilled.keyText(page.data.meta_description) ? (
										<meta name="description" content={page.data.meta_description} />
									) : null}
									{isFilled.image(page.data.meta_image) ? (
										<meta property="og:image" content={asImageSrc(page.data.meta_image)} />
									) : null}
								</Head>
								<SliceZone slices={page.data.slices} components={components} />
							</>
						);
					}

					export async function getStaticProps({
						params,
						previewData,
					}: GetStaticPropsContext<Params>) {
						const client = createClient({ previewData });
						const page = await client.getByUID("${model.id}", params!.uid);

						return { props: { page } };
					}

					export async function getStaticPaths() {
						const client = createClient();
						const pages = await client.getAllByType("${model.id}");

						return {
							paths: pages.map((page) => asLink(page)),
							fallback: false,
						};
					}
				`;
			} else {
				appFileContent = source`
					import { type Metadata } from "next";
					import { notFound } from "next/navigation";
					import { asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default async function Page() {
						const client = createClient();
						const page = await client.getSingle("${model.id}").catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}

					export async function generateMetadata(): Promise<Metadata> {
						const client = createClient();
						const page = await client.getSingle("${model.id}").catch(() => notFound());

						return {
							title: page.data.meta_title,
							description: page.data.meta_description,
							openGraph: {
								images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
							},
						};
					}
				`;
				pagesFileContent = source`
					import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
					import Head from "next/head";
					import { isFilled, asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { components } from "@/slices";
					import { createClient } from "@/prismicio";

					export default function Page({
						page,
					}: InferGetStaticPropsType<typeof getStaticProps>) {
						return (
							<>
								<Head>
									<title>{page.data.meta_title}</title>
									{isFilled.keyText(page.data.meta_description) ? (
										<meta name="description" content={page.data.meta_description} />
									) : null}
									{isFilled.image(page.data.meta_image) ? (
										<meta property="og:image" content={asImageSrc(page.data.meta_image)} />
									) : null}
								</Head>
								<SliceZone slices={page.data.slices} components={components} />
							</>
						);
					}

					export async function getStaticProps({ previewData }: GetStaticPropsContext) {
						const client = createClient({ previewData });
						const page = await client.getSingle("${model.id}");

						return { props: { page } };
					}
				`;
			}
		} else {
			if (model.repeatable) {
				appFileContent = source`
					import { notFound } from "next/navigation";
					import { asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default async function Page({ params }) {
						const { uid } = await params;
						const client = createClient();
						const page = await client.getByUID("${model.id}", uid).catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}

					export async function generateMetadata({ params }) {
						const { uid } = await params;
						const client = createClient();
						const page = await client.getByUID("${model.id}", uid).catch(() => notFound());

						return {
							title: page.data.meta_title,
							description: page.data.meta_description,
							openGraph: {
								images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
							},
						};
					}

					export async function generateStaticParams() {
						const client = createClient();
						const pages = await client.getAllByType("${model.id}");

						return pages.map((page) => ({ uid: page.uid }));
					}
				`;
				pagesFileContent = source`
					import Head from "next/head";
					import { isFilled, asLink, asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { components } from "@/slices";
					import { createClient } from "@/prismicio";

					export default function Page({ page }) {
						return (
							<>
								<Head>
									<title>{page.data.meta_title}</title>
									{isFilled.keyText(page.data.meta_description) ? (
										<meta name="description" content={page.data.meta_description} />
									) : null}
									{isFilled.image(page.data.meta_image) ? (
										<meta property="og:image" content={asImageSrc(page.data.meta_image)} />
									) : null}
								</Head>
								<SliceZone slices={page.data.slices} components={components} />
							</>
						);
					}

					export async function getStaticProps({ params, previewData }) {
						const client = createClient({ previewData });
						const page = await client.getByUID("${model.id}", params.uid);

						return { props: { page } };
					}

					export async function getStaticPaths() {
						const client = createClient();
						const pages = await client.getAllByType("${model.id}");

						return {
							paths: pages.map((page) => asLink(page)),
							fallback: false,
						};
					}
				`;
			} else {
				appFileContent = source`
					import { notFound } from "next/navigation";
					import { asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { createClient } from "@/prismicio";
					import { components } from "@/slices";

					export default async function Page() {
						const client = createClient();
						const page = await client.getSingle("${model.id}").catch(() => notFound());

						return <SliceZone slices={page.data.slices} components={components} />;
					}

					export async function generateMetadata() {
						const client = createClient();
						const page = await client.getSingle("${model.id}").catch(() => notFound());

						return {
							title: page.data.meta_title,
							description: page.data.meta_description,
							openGraph: {
								images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
							},
						};
					}
				`;
				pagesFileContent = source`
					import Head from "next/head";
					import { isFilled, asImageSrc } from "@prismicio/client";
					import { SliceZone } from "@prismicio/react";

					import { components } from "@/slices";
					import { createClient } from "@/prismicio";

					export default function Page({ page }) {
						return (
							<>
								<Head>
									<title>{page.data.meta_title}</title>
									{isFilled.keyText(page.data.meta_description) ? (
										<meta name="description" content={page.data.meta_description} />
									) : null}
									{isFilled.image(page.data.meta_image) ? (
										<meta property="og:image" content={asImageSrc(page.data.meta_image)} />
									) : null}
								</Head>
								<SliceZone slices={page.data.slices} components={components} />
							</>
						);
					}

					export async function getStaticProps({ previewData }) {
						const client = createClient({ previewData });
						const page = await client.getSingle("${model.id}");

						return { props: { page } };
					}
				`;
			}
		}

		if (options.format) {
			appFileContent = await helpers.format(appFileContent, appFilePath, {
				includeNewlineAtEnd: false,
			});
			pagesFileContent = await helpers.format(pagesFileContent, pagesFilePath, {
				includeNewlineAtEnd: false,
			});
		}

		return [
			{
				label: "App Router",
				content: source`
					## Create your ${model.label}'s page component

					Add a new route by creating an \`app/${appFilePath}\` file. (If the route should be nested in a child directory, you can create the file in a directory, like \`app/marketing/${appFilePath}\`.)

					Paste in this code:

					${`~~~${extension} [app/${appFilePath}]\n${appFileContent}\n~~~`}

					Make sure all of your import paths are correct. See the [install guide](https://prismic.io/docs/setup-nextjs) for more information.
				`,
			},
			{
				label: "Pages Router",
				content: source`
					## Create your ${model.label}'s page component

					Add a new route by creating a \`pages/${pagesFilePath}\` file. (If the route should be nested in a child directory, you can create the file in a directory, like \`pages/marketing/${pagesFilePath}\`.)

					${`~~~${extension} [pages/${pagesFilePath}]\n${pagesFileContent}\n~~~`}

					Make sure all of your import paths are correct. See the [install guide](https://prismic.io/docs/setup-nextjs) for more information.
				`,
			},
		];
	}

	return [];
};

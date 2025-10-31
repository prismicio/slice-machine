import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { stripIndent } from "common-tags";

import type {
	CustomTypeUpdateRouteHook,
	CustomTypeUpdateRouteHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import {
	checkHasProjectFile,
	writeProjectFile,
} from "@slicemachine/plugin-kit/fs";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getJSFileExtension } from "../lib/getJSFileExtension";

import type { PluginOptions } from "../types";
import { checkHasAppRouter } from "../lib/checkHasAppRouter";
import path from "node:path";

type Args = {
	data: CustomTypeUpdateRouteHookData;
} & SliceMachineContext<PluginOptions>;

const createComponentFile = async ({ data, helpers, options }: Args) => {
	const isTypeScript = await checkIsTypeScriptProject({
		helpers,
		options,
	});
	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers,
	});
	const hasAppRouter = await checkHasAppRouter({ helpers });

	const pageRoute = data.model.route ?? data.model.id;
	const pageRouteLength = pageRoute.split("/").length - 1;

	const contents = generatePageComponent(data.model, {
		hasAppRouter,
		isTypeScript,
		hasSrcDirectory,
		pageRouteLength,
	});

	const routeBase = hasAppRouter ? "app" : "pages";
	const routeDirectoryPath = hasSrcDirectory
		? path.join("src", routeBase)
		: routeBase;

	const extension = await getJSFileExtension({
		helpers,
		options,
		jsx: true,
	});
	let filePath: string;

	if (hasAppRouter) {
		const fileName = data.model.repeatable
			? `[uid]/page.${extension}`
			: `page.${extension}`;

		filePath = path.join(routeDirectoryPath, pageRoute, fileName);
	} else {
		const fileName = data.model.repeatable
			? `${pageRoute}/[uid].${extension}`
			: `${pageRoute}.${extension}`;

		filePath = path.join(routeDirectoryPath, fileName);
	}

	await writeProjectFile({
		filename: filePath,
		contents,
		format: options.format,
		helpers,
	});
};

export const pageRouteCreate: CustomTypeUpdateRouteHook<PluginOptions> = async (
	data,
	context,
) => {
	await createComponentFile({ data, ...context });
};

export function generatePageComponent(
	customType: CustomType,
	env: {
		hasAppRouter: boolean;
		isTypeScript: boolean;
		hasSrcDirectory: boolean;
		pageRouteLength: number;
	},
): string {
	if (env.hasAppRouter) {
		return generateAppRouterPage(
			customType,
			env.isTypeScript,
			env.hasSrcDirectory,
			env.pageRouteLength,
		);
	} else {
		return generatePagesRouterPage(
			customType,
			env.isTypeScript,
			env.hasSrcDirectory,
			env.pageRouteLength,
		);
	}
}

function generateAppRouterPage(
	customType: CustomType,
	isTypeScript: boolean,
	hasSrcDirectory: boolean,
	pageRouteLength: number,
): string {
	// Calculate import paths based on directory depth
	// Single: app/[id]/page.tsx → ../../prismicio (or ../../../prismicio if src/)
	// Repeatable: app/[id]/[uid]/page.tsx → ../../../prismicio (or ../../../../prismicio if src/)
	const levelsUp = customType.repeatable
		? pageRouteLength + 1
		: pageRouteLength;
	const levelsUpWithSrc = hasSrcDirectory ? levelsUp + 1 : levelsUp;
	const importPath = "../".repeat(levelsUpWithSrc) + "prismicio";
	const slicesPath = "../".repeat(levelsUpWithSrc) + "slices";

	if (customType.repeatable) {
		if (isTypeScript) {
			return stripIndent`
        import { Metadata } from "next";
        import { notFound } from "next/navigation";
        import { asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { createClient } from "${importPath}";
        import { components } from "${slicesPath}";

        type Params = { uid: string };

        export default async function Page({ params }: { params: Promise<Params> }) {
          const { uid } = await params;
          const client = createClient();
          const page = await client
            .getByUID("${customType.id}", uid)
            .catch(() => notFound());

          return <SliceZone slices={page.data.slices} components={components} />;
        }

        export async function generateMetadata({
          params,
        }: {
          params: Promise<Params>;
        }): Promise<Metadata> {
          const { uid } = await params;
          const client = createClient();
          const page = await client
            .getByUID("${customType.id}", uid)
            .catch(() => notFound());

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
          const pages = await client.getAllByType("${customType.id}");

          return pages.map((page) => ({ uid: page.uid }));
        }
      `;
		} else {
			return stripIndent`
        import { notFound } from "next/navigation";
        import { asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { createClient } from "${importPath}";
        import { components } from "${slicesPath}";

        export default async function Page({ params }) {
          const { uid } = await params;
          const client = createClient();
          const page = await client
            .getByUID("${customType.id}", uid)
            .catch(() => notFound());

          return <SliceZone slices={page.data.slices} components={components} />;
        }

        export async function generateMetadata({ params }) {
          const { uid } = await params;
          const client = createClient();
          const page = await client
            .getByUID("${customType.id}", uid)
            .catch(() => notFound());

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
          const pages = await client.getAllByType("${customType.id}");

          return pages.map((page) => ({ uid: page.uid }));
        }
      `;
		}
	} else {
		// Single type
		if (isTypeScript) {
			return stripIndent`
        import { type Metadata } from "next";
        import { notFound } from "next/navigation";
        import { asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { createClient } from "${importPath}";
        import { components } from "${slicesPath}";

        export default async function Page() {
          const client = createClient();
          const page = await client.getSingle("${customType.id}").catch(() => notFound());

          return <SliceZone slices={page.data.slices} components={components} />;
        }

        export async function generateMetadata(): Promise<Metadata> {
          const client = createClient();
          const page = await client.getSingle("${customType.id}").catch(() => notFound());

          return {
            title: page.data.meta_title,
            description: page.data.meta_description,
            openGraph: {
              images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
            },
          };
        }
      `;
		} else {
			return stripIndent`
        import { notFound } from "next/navigation";
        import { asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { createClient } from "${importPath}";
        import { components } from "${slicesPath}";

        export default async function Page() {
          const client = createClient();
          const page = await client.getSingle("${customType.id}").catch(() => notFound());

          return <SliceZone slices={page.data.slices} components={components} />;
        }

        export async function generateMetadata() {
          const client = createClient();
          const page = await client.getSingle("${customType.id}").catch(() => notFound());

          return {
            title: page.data.meta_title,
            description: page.data.meta_description,
            openGraph: {
              images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],
            },
          };
        }
      `;
		}
	}
}

function generatePagesRouterPage(
	customType: CustomType,
	isTypeScript: boolean,
	hasSrcDirectory: boolean,
	pageRouteLength: number,
): string {
	// Calculate import paths based on directory depth
	// Single: pages/[id].tsx → ../prismicio (or ../../prismicio if src/)
	// Repeatable: pages/[id]/[uid].tsx → ../../prismicio (or ../../../prismicio if src/)
	const levelsUp = customType.repeatable
		? pageRouteLength + 1
		: pageRouteLength;
	const levelsUpWithSrc = hasSrcDirectory ? levelsUp + 1 : levelsUp;
	const importPath = "../".repeat(levelsUpWithSrc) + "prismicio";
	const slicesPath = "../".repeat(levelsUpWithSrc) + "slices";

	if (customType.repeatable) {
		if (isTypeScript) {
			return stripIndent`
        import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
        import Head from "next/head";
        import { isFilled, asLink, asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { components } from "${slicesPath}";
        import { createClient } from "${importPath}";

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
                  <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
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
          const page = await client.getByUID("${customType.id}", params!.uid);

          return { props: { page } };
        }

        export async function getStaticPaths() {
          const client = createClient();
          const pages = await client.getAllByType("${customType.id}");

          return {
            paths: pages.map((page) => asLink(page)),
            fallback: false,
          };
        }
      `;
		} else {
			return stripIndent`
        import Head from "next/head";
        import { isFilled, asLink, asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { components } from "${slicesPath}";
        import { createClient } from "${importPath}";

        export default function Page({ page }) {
          return (
            <>
              <Head>
                <title>{page.data.meta_title}</title>
                {isFilled.keyText(page.data.meta_description) ? (
                  <meta name="description" content={page.data.meta_description} />
                ) : null}
                {isFilled.image(page.data.meta_image) ? (
                  <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
                ) : null}
              </Head>
              <SliceZone slices={page.data.slices} components={components} />
            </>
          );
        }

        export async function getStaticProps({ params, previewData }) {
          const client = createClient({ previewData });
          const page = await client.getByUID("${customType.id}", params.uid);

          return { props: { page } };
        }

        export async function getStaticPaths() {
          const client = createClient();
          const pages = await client.getAllByType("${customType.id}");

          return {
            paths: pages.map((page) => asLink(page)),
            fallback: false,
          };
        }
      `;
		}
	} else {
		// Single type
		if (isTypeScript) {
			return stripIndent`
        import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
        import Head from "next/head";
        import { isFilled, asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { components } from "${slicesPath}";
        import { createClient } from "${importPath}";

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
                  <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
                ) : null}
              </Head>
              <SliceZone slices={page.data.slices} components={components} />
            </>
          );
        }

        export async function getStaticProps({ previewData }: GetStaticPropsContext) {
          const client = createClient({ previewData });
          const page = await client.getSingle("${customType.id}");

          return { props: { page } };
        }
      `;
		} else {
			return stripIndent`
        import Head from "next/head";
        import { isFilled, asImageSrc } from "@prismicio/client";
        import { SliceZone } from "@prismicio/react";

        import { components } from "${slicesPath}";
        import { createClient } from "${importPath}";

        export default function Page({ page }) {
          return (
            <>
              <Head>
                <title>{page.data.meta_title}</title>
                {isFilled.keyText(page.data.meta_description) ? (
                  <meta name="description" content={page.data.meta_description} />
                ) : null}
                {isFilled.image(page.data.meta_image) ? (
                  <meta property="og:image" content={asImageSrc(page.data.meta_image) || ""} />
                ) : null}
              </Head>
              <SliceZone slices={page.data.slices} components={components} />
            </>
          );
        }

        export async function getStaticProps({ previewData }) {
          const client = createClient({ previewData });
          const page = await client.getSingle("${customType.id}");

          return { props: { page } };
        }
      `;
		}
	}
}

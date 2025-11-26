import { source as svelte, source as ts, source as js } from "common-tags";

export function prismicIOFileTemplate(args: { typescript: boolean }): string {
	const { typescript } = args;

	const TS = ts`
		import { createClient as baseCreateClient, type Route } from "@prismicio/client";
		import { type CreateClientConfig, enableAutoPreviews } from '@prismicio/svelte/kit';
		import prismicConfig from "../../prismic.config.json";

		/**
		 * The project's Prismic repository name.
		 */
		export const repositoryName = prismicConfig.repositoryName;

		/**
		 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
		 *
		 * {@link https://prismic.io/docs/route-resolver}
		 */
		// TODO: Update the routes array to match your project's route structure.
		const routes: Route[] = [
			// Examples:
			// { type: "homepage", path: "/" },
			// { type: "page", path: "/:uid" },
		];

		/**
		 * Creates a Prismic client for the project's repository. The client is used to
		 * query content from the Prismic API.
		 *
		 * @param config - Configuration for the Prismic client.
		 */
		export const createClient = ({ cookies, ...config }: CreateClientConfig = {}) => {
			const client = baseCreateClient(repositoryName, {
				routes,
				...config,
			});

			enableAutoPreviews({ client, cookies });

			return client;
		};
	`;

	const JS = js`
		import { createClient as baseCreateClient } from "@prismicio/client";
		import { enableAutoPreviews } from '@prismicio/svelte/kit';
		import prismicConfig from "../../prismic.config.json";

		/**
		 * The project's Prismic repository name.
		 */
		export const repositoryName = prismicConfig.repositoryName;

		/**
		 * A list of Route Resolver objects that define how a document's \`url\` field is resolved.
		 *
		 * {@link https://prismic.io/docs/route-resolver#route-resolver}
		 *
		 * @type {import("@prismicio/client").Route[]}
		 */
		// TODO: Update the routes array to match your project's route structure.
		const routes = [
			// Examples:
			// { type: "homepage", path: "/" },
			// { type: "page", path: "/:uid" },
		];

		/**
		 * Creates a Prismic client for the project's repository. The client is used to
		 * query content from the Prismic API.
		 *
		 * @param {import('@prismicio/svelte/kit').CreateClientConfig} config - Configuration for the Prismic client.
		 */
		export const createClient = ({ cookies, ...config } = {}) => {
			const client = prismic.createClient(repositoryName, {
				routes,
				...config,
			});

			enableAutoPreviews({ client, cookies });

			return client;
		};
	`;

	return typescript ? TS : JS;
}

export function previewAPIRouteTemplate(args: { typescript: boolean }): string {
	const { typescript } = args;

	const TS = ts`
		import { redirectToPreviewURL } from '@prismicio/svelte/kit';
		import { createClient } from '$lib/prismicio';
		import type { RequestHandler } from "./$types";

		export const GET: RequestHandler = async ({ fetch, request, cookies }) => {
			const client = createClient({ fetch });

			return await redirectToPreviewURL({ client, request, cookies });
		}
	`;

	const JS = js`
		import { redirectToPreviewURL } from '@prismicio/svelte/kit';
		import { createClient } from '$lib/prismicio';

		/* @type {import("./$types").RequestHandler} */
		export async function GET({ fetch, request, cookies }) {
			const client = createClient({ fetch });

			return await redirectToPreviewURL({ client, request, cookies });
		}
	`;

	return typescript ? TS : JS;
}

export function rootLayoutTemplate(args: { version: number }): string {
	const { version } = args;

	const v5 = svelte`
		<script>
			import { isFilled, asImageSrc } from '@prismicio/client';
			import { PrismicPreview } from '@prismicio/svelte/kit';
			import { page } from '$app/state';
			import { repositoryName } from '$lib/prismicio';

			const { children } = $props();
		</script>

		<svelte:head>
			<title>{page.data.page?.data.meta_title}</title>
			<meta property="og:title" content={page.data.page?.data.meta_title} />
			{#if isFilled.keyText(page.data.page?.data.meta_description)}
				<meta name="description" content={page.data.page.data.meta_description} />
				<meta property="og:description" content={page.data.page.data.meta_description} />
			{/if}
			{#if isFilled.image(page.data.page?.data.meta_image)}
				<meta property="og:image" content={asImageSrc(page.data.page.data.meta_image)} />
			{/if}
		</svelte:head>
		{@render children()}
		<PrismicPreview {repositoryName} />
	`;

	const v4 = svelte`
		<script>
			import { isFilled, asImageSrc } from '@prismicio/client';
			import { PrismicPreview } from '@prismicio/svelte/kit';
			import { page } from '$app/state';
			import { repositoryName } from '$lib/prismicio';
		</script>

		<svelte:head>
			<title>{page.data.page?.data.meta_title}</title>
			<meta property="og:title" content={page.data.page?.data.meta_title} />
			{#if isFilled.keyText(page.data.page?.data.meta_description)}
				<meta name="description" content={page.data.page.data.meta_description} />
				<meta property="og:description" content={page.data.page.data.meta_description} />
			{/if}
			{#if isFilled.image(page.data.page?.data.meta_image)}
				<meta property="og:image" content={asImageSrc(page.data.page.data.meta_image)} />
			{/if}
		</svelte:head>
		<slot />
		<PrismicPreview {repositoryName} />
	`;

	return version <= 4 ? v4 : v5;
}

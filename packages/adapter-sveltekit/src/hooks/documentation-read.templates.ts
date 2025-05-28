import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { source as svelte, source as ts, source as js } from "common-tags";

export function componentFileTemplate(args: { typescript: boolean }): string {
	const { typescript } = args;

	const TS = svelte`
		<script lang="ts">
			import { SliceZone } from "@prismicio/svelte";

			import { components } from "$lib/slices";
			import type { PageData } from "./$types";

			const { data }: PageData = $props();
		</script>

		<SliceZone slices={data.page.data.slices} {components} />
	`;

	const JS = svelte`
		<script>
			import { SliceZone } from "@prismicio/svelte";

			import { components } from "$lib/slices";

			/* @type {import("./$types").PageData} */
			const { data } = $props();
		</script>

		<SliceZone slices={data.page.data.slices} {components} />
	`;

	return typescript ? TS : JS;
}

export function dataFileTemplate(args: {
	model: CustomType;
	typescript: boolean;
}): string {
	const { model, typescript } = args;

	const repeatableTS = ts`
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

	const nonrepeatableTS = ts`
		import { createClient } from "$lib/prismicio";
		import type { PageServerLoad, EntryGenerator } from './$types';

		export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
			const client = createClient({ fetch, cookies });

			const page = await client.getSingle("${model.id}");

			return {
				page,
			};
		}

		export const entries: EntryGenerator = async () => {
			return [{}]
		}
	`;

	const repeatableJS = js`
		import { createClient } from "$lib/prismicio";

		/* @type {import("./$types").PageServerLoad} */
		export async function load({ params, fetch, cookies }) {
			const client = createClient({ fetch, cookies });

			const page = await client.getByUID("${model.id}", params.uid);

			return {
				page,
			};
		}

		/* @type {import("./$types").EntryGenerator} */
		export async function entries() {
			const client = createClient();

			const pages = await client.getAllByType("${model.id}");

			return pages.map((page) => {
				return { uid: page.uid };
			});
		}
	`;

	const nonrepeatableJS = js`
		import { createClient } from "$lib/prismicio";

		/* @type {import("./$types").PageServerLoad} */
		export async function load({ params, fetch, cookies }) {
			const client = createClient({ fetch, cookies });

			const page = await client.getSingle("${model.id}");

			return {
				page,
			};
		}

		/* @type {import("./$types").EntryGenerator} */
		export async function entries() {
			return [{}]
		}
	`;

	if (typescript) {
		return model.repeatable ? repeatableTS : nonrepeatableTS;
	}

	return model.repeatable ? repeatableJS : nonrepeatableJS;
}

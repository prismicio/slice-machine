import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { source as svelte } from "common-tags";

import { pascalCase } from "../lib/pascalCase";

const PLACEHOLDER = `
Placeholder component for {slice.slice_type} (variation: {slice.variation}) slices.
<br />
<strong>You can edit this slice directly in your code editor.</strong>
<!--
💡 Use Prismic MCP with your code editor

Get AI-powered help to build your slice components — based on your actual model.

▶️ Setup:
1. Add a new MCP Server in your code editor:

{
  "mcpServers": {
    "Prismic MCP": {
      "command": "npx",
      "args": ["-y", "@prismicio/mcp-server"]
    }
  }
}

2. Select a model optimized for coding (e.g. Claude 3.7 Sonnet or similar)

✅ Then open your slice file and ask your code editor:
	"Code this slice"

Your code editor reads your slice model and helps you code faster ⚡
📚 Give your feedback: https://community.prismic.io/t/help-us-shape-the-future-of-slice-creation/19505
-->
`;

export function sliceTemplate(args: {
	model: SharedSlice;
	typescript: boolean;
	version: number;
}): string {
	const { model, typescript, version } = args;

	const pascalName = pascalCase(model.name);

	const v5TS = svelte`
		<script lang="ts">
			import type { Content } from '@prismicio/client';
			import type { SliceComponentProps } from '@prismicio/svelte';

			type Props = SliceComponentProps<Content.${pascalName}Slice>;

			const { slice }: Props = $props();
		</script>

		<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			${PLACEHOLDER}
		</section>
	`;

	const v5JS = svelte`
		<script>
			/* @typedef {import("@prismicio/client").Content} Content */
			/* @typedef {import("@prismicio/svelte").SliceComponentProps} SliceComponentProps */

			/* @type {SliceComponentProps<Content.${pascalName}Slice>} */
			const { slice } = $props();
		</script>

		<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			${PLACEHOLDER}
		</section>
	`;

	const v4TS = svelte`
		<script lang="ts">
			import type { Content } from '@prismicio/client';

			export let slice: Content.${pascalName}Slice;
		</script>

		<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			${PLACEHOLDER}
		</section>
	`;

	const v4JS = svelte`
		<script>
			/** @type {import("@prismicio/client").Content.${pascalName}Slice} */
			export let slice;
		</script>

		<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			${PLACEHOLDER}
		</section>
	`;

	if (typescript) {
		return version <= 4 ? v4TS : v5TS;
	}

	return version <= 4 ? v4JS : v5JS;
}

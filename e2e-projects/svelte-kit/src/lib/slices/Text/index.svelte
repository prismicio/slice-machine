<script lang="ts">
	import type { Content, SliceZone } from '@prismicio/client';
	import { PrismicRichText } from '@prismicio/svelte';

	export let slice: Content.TextSlice;
	export let slices: SliceZone;
	export let index: number;
	export let context: unknown;
</script>

<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
	<PrismicRichText field={slice.primary.text} />
</section>

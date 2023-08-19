<script lang="ts">
	import { SliceSimulator } from '@slicemachine/adapter-svelte-kit/simulator';
	import { SliceZone } from '@prismicio/svelte';
	import { components } from '$lib/slices';
</script>

<SliceSimulator let:slices>
	<SliceZone {slices} {components} />
</SliceSimulator>

<script lang="ts">
	import type { SliceZone } from "@prismicio/client";
	import {
		type SliceSimulatorProps,
		SimulatorManager,
		StateEventType,
		disableEventHandler,
		getDefaultMessage,
		getDefaultProps,
		getDefaultSlices,
		onClickHandler,
		simulatorClass,
		simulatorRootClass,
	} from "@prismicio/simulator/kit";
	import type { Snippet } from "svelte";

	type Props = SliceSimulatorProps & {
		class?: string;
		children?: Snippet<[SliceZone]>;
	};

	const defaultProps = getDefaultProps();

	const {
		zIndex = defaultProps.zIndex,
		background = defaultProps.background,
		class: klass,
		children,
	}: Props = $props();

	let slices = $state(getDefaultSlices());
	let message = $state(getDefaultMessage());

	if (typeof window !== "undefined") {
		const simulatorManager = new SimulatorManager();

		simulatorManager.state.on(
			StateEventType.Slices,
			(newSlices) => {
				slices = newSlices;
			},
			"simulator-slices",
		);
		simulatorManager.state.on(
			StateEventType.Message,
			(newMessage) => {
				message = newMessage;
			},
			"simulator-message",
		);

		simulatorManager.init();
	}
</script>

<div
	class={[simulatorClass, klass]}
	style="z-index: {zIndex}; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; overflow: auto; background: {background}"
>
	{#if message}
		<article>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html message}
		</article>
	{:else if slices.length}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			id="root"
			class={simulatorRootClass}
			onclick={onClickHandler}
			onsubmit={disableEventHandler}
			onkeypress={disableEventHandler}
		>
			{@render children?.(slices)}
		</div>
	{/if}
</div>

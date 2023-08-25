<script>
	import {
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

	const defaultProps = getDefaultProps();

	export let zIndex = defaultProps.zIndex;
	export let background = defaultProps.background;

	let slices = getDefaultSlices();
	let message = getDefaultMessage();

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
	class="{simulatorClass} {$$props.class}"
	style="z-index: {zIndex}; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; overflow: auto; background: {background}"
>
	{#if message}
		<article>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html message}
		</article>
	{:else if slices.length}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			id="root"
			class={simulatorRootClass}
			on:click={onClickHandler}
			on:submit={disableEventHandler}
			on:keypress={disableEventHandler}
		>
			<slot {slices} />
		</div>
	{/if}
</div>

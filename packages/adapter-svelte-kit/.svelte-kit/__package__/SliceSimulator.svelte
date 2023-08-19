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

	let defaultProps = getDefaultProps();

	/**
	 * @type {number | undefined}
	 */
	export let zIndex = defaultProps.zIndex;
	/**
	 * @type {string | undefined}
	 */
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
		<article>{@html message}</article>
	{:else if slices.length}
		<div
			id="root"
			class={simulatorRootClass}
			on:click={onClickHandler}
			on:submit={disableEventHandler}
		>
			<slot {slices} />
		</div>
	{/if}
</div>

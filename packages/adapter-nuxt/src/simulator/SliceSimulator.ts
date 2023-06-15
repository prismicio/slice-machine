import {
	defineComponent,
	ref,
	onMounted,
	h,
	PropType,
	VNodeArrayChildren,
	AllowedComponentProps,
	ComponentCustomProps,
	VNodeProps,
	onUnmounted,
} from "vue";

import {
	getDefaultProps,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	simulatorClass,
	simulatorRootClass,
	SliceSimulatorProps as BaseSliceSimulatorProps,
	StateEventType,
	SimulatorManager,
} from "@prismicio/simulator/kit";

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state">;

const simulatorManager = new SimulatorManager();

export const SliceSimulatorImpl = /*#__PURE__*/ defineComponent({
	name: "SliceSimulator",
	props: {
		zIndex: {
			type: Number as PropType<Required<SliceSimulatorProps["zIndex"]>>,
			default: getDefaultProps().zIndex,
			required: false,
		},
		background: {
			type: String as PropType<Required<SliceSimulatorProps["background"]>>,
			default: getDefaultProps().background,
			required: false,
		},
	},
	setup(props, { slots }) {
		const slices = ref(getDefaultSlices());
		const message = ref(getDefaultMessage());

		onMounted(() => {
			simulatorManager.state.on(
				StateEventType.Slices,
				(_slices) => {
					slices.value = _slices;
				},
				"simulator-slices",
			);
			simulatorManager.state.on(
				StateEventType.Message,
				(_message) => {
					message.value = _message;
				},
				"simulator-message",
			);

			simulatorManager.init();
		});

		onUnmounted(() => {
			simulatorManager.state.off(StateEventType.Slices, "simulator-slices");

			simulatorManager.state.off(StateEventType.Message, "simulator-message");
		});

		return () => {
			const children: VNodeArrayChildren = [];

			if (message.value) {
				children.push(
					h("article", {
						innerHTML: message.value,
					}),
				);
			} else if (slices.value.length && slots.default) {
				children.push(
					h(
						"div",
						{
							id: "root",
							class: simulatorRootClass,
							onClickCapture: onClickHandler,
							onSubmitCapture: disableEventHandler,
						},
						[
							slots.default({
								slices: slices.value,
							}),
						],
					),
				);
			}

			return h(
				"div",
				{
					class: simulatorClass,
					style: {
						zIndex: props.zIndex,
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100vh",
						overflow: "auto",
						background: props.background,
					},
				},
				children,
			);
		};
	},
});

// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
export const SliceSimulator = SliceSimulatorImpl as unknown as {
	new (): {
		$props: AllowedComponentProps &
			ComponentCustomProps &
			VNodeProps &
			SliceSimulatorProps;
	};
};

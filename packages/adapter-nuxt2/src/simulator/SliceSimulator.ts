import Vue, { PropType, VNodeChildren } from "vue";
import { CreateElement, ExtendedVue } from "vue/types/vue";

import {
	SliceSimulatorState,
	SliceSimulatorOptions,
	SliceSimulatorProps as BaseSliceSimulatorProps,
} from "@prismicio/simulator/kit";
import * as simulatorKit from "@prismicio/simulator/dist/kit.cjs";
const {
	getDefaultProps,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	simulatorClass,
	simulatorRootClass,
	StateEventType,
	SimulatorManager,
} = simulatorKit as unknown as typeof import("@prismicio/simulator/kit");

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state">;

const simulatorManager = new SimulatorManager();

export const SliceSimulator = {
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
	data() {
		return {
			manager: simulatorManager,
			slices: getDefaultSlices(),
			message: getDefaultMessage(),
		};
	},
	mounted(this: SliceSimulatorOptions) {
		this.manager.state.on(
			StateEventType.Slices,
			(slices) => {
				this.slices = slices;
			},
			"simulator-slices",
		);
		this.manager.state.on(
			StateEventType.Message,
			(message) => {
				this.message = message;
			},
			"simulator-message",
		);

		this.manager.init();
	},
	destroyed(this: SliceSimulatorOptions) {
		this.manager.state.off(StateEventType.Slices, "simulator-slices");
		this.manager.state.off(StateEventType.Message, "simulator-message");
	},
	render(this: SliceSimulatorOptions & Vue, h: CreateElement) {
		const children: VNodeChildren = [];

		if (this.message) {
			children.push(
				h("article", {
					domProps: {
						innerHTML: this.message,
					},
				}),
			);
		} else if (this.slices.length && this.$scopedSlots.default) {
			children.push(
				h(
					"div",
					{
						attrs: { id: "root" },
						class: simulatorRootClass,
						on: {
							"!click": onClickHandler,
							"!submit": disableEventHandler,
						},
					},
					[
						this.$scopedSlots.default({
							slices: this.slices,
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
					zIndex: this.zIndex,
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					height: "100vh",
					overflow: "auto",
					background: this.background,
				},
			},
			children,
		);
	},
	// This is some weird ass trick to get around `Vue.extend` messing up `this` context, don't do this at home kids
} as unknown as ExtendedVue<
	Vue,
	SliceSimulatorState,
	Record<string, never>,
	Record<string, never>,
	SliceSimulatorProps,
	void
>;

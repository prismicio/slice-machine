import Vue, { PropType, VNodeChildren } from "vue";
import { CreateElement, ExtendedVue } from "vue/types/vue";

import {
	getDefaultProps,
	getDefaultManagedState,
	getDefaultSlices,
	getDefaultMessage,
	onClickHandler,
	disableEventHandler,
	simulatorClass,
	simulatorRootClass,
	SliceSimulatorState,
	SliceSimulatorOptions,
	SliceSimulatorProps as BaseSliceSimulatorProps,
	StateManagerEventType,
	StateManagerStatus,
	CoreManager,
} from "@prismicio/slice-simulator-core";

export type SliceSimulatorProps = Omit<BaseSliceSimulatorProps, "state">;

const coreManager = new CoreManager();

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
			coreManager,
			managedState: getDefaultManagedState(),
			slices: getDefaultSlices(),
			message: getDefaultMessage(),
		};
	},
	mounted(this: SliceSimulatorOptions) {
		this.coreManager.stateManager.on(
			StateManagerEventType.ManagedState,
			(managedState) => {
				this.managedState = managedState;
			},
			"simulator-managed-state",
		);
		this.coreManager.stateManager.on(
			StateManagerEventType.Slices,
			(slices) => {
				this.slices = slices;
			},
			"simulator-slices",
		);
		this.coreManager.stateManager.on(
			StateManagerEventType.Message,
			(message) => {
				this.message = message;
			},
			"simulator-message",
		);

		this.coreManager.init(getDefaultProps().state);
	},
	destroyed(this: SliceSimulatorOptions) {
		this.coreManager.stateManager.off(
			StateManagerEventType.ManagedState,
			"simulator-managed-state",
		);
		this.coreManager.stateManager.off(
			StateManagerEventType.Slices,
			"simulator-slices",
		);
		this.coreManager.stateManager.off(
			StateManagerEventType.Message,
			"simulator-message",
		);
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
						style:
							this.managedState.status !== StateManagerStatus.Loaded
								? { display: "none" }
								: undefined,
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

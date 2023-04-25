import { defineSliceMachinePlugin } from "../../src";
import { REQUIRED_ADAPTER_HOOKS } from "../../src/createSliceMachinePluginRunner";

export const valid = defineSliceMachinePlugin({
	meta: {
		name: "adapter-valid",
	},
	setup({ hook }) {
		for (const adapterHook of REQUIRED_ADAPTER_HOOKS) {
			hook(adapterHook, () => {
				throw new Error("not implemented");
			});
		}
	},
});

export const invalid = defineSliceMachinePlugin({
	meta: {
		name: "adapter-invalid",
	},
	setup() {
		/* ... */
	},
});

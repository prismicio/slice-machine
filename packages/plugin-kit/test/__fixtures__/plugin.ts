import { defineSliceMachinePlugin } from "../../src";

export const valid = defineSliceMachinePlugin({
	meta: {
		name: "plugin-valid",
	},
	setup({ hook }) {
		hook("slice:create", () => {
			/* ... */
		});
	},
});

export const throwAny = defineSliceMachinePlugin({
	meta: {
		name: "plugin-throw-any",
	},
	setup() {
		throw "plugin-throw-any";
	},
});

export const throwError = defineSliceMachinePlugin({
	meta: {
		name: "plugin-throw-error",
	},
	setup() {
		throw new Error("plugin-throw-error");
	},
});

import * as t from "io-ts";

export const SliceMachinePlugin = t.intersection([
	t.type({
		meta: t.type({
			name: t.string,
		}),
		// TODO: `t.Function` is deprecated. Replace with a custom primative.
		setup: t.Function,
	}),
	t.partial({
		defaultOptions: t.UnknownRecord,
	}),
]);
export type SliceMachinePlugin = t.TypeOf<typeof SliceMachinePlugin>;

export const SliceMachineConfigPluginRegistration = t.union([
	t.string,
	SliceMachinePlugin,
	t.intersection([
		t.type({
			resolve: t.union([t.string, SliceMachinePlugin]),
		}),
		t.partial({
			options: t.UnknownRecord,
		}),
	]),
]);
export type SliceMachineConfigPluginRegistration = t.TypeOf<
	typeof SliceMachineConfigPluginRegistration
>;

export const SliceMachineConfig = t.intersection([
	t.type({
		repositoryName: t.string,
		adapter: SliceMachineConfigPluginRegistration,
	}),
	t.partial({
		libraries: t.array(t.string),
		localSliceSimulatorURL: t.string,
		plugins: t.array(SliceMachineConfigPluginRegistration),
	}),
]);
export type SliceMachineConfig = t.TypeOf<typeof SliceMachineConfig>;

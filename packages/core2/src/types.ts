import * as t from "io-ts";

export const Plugin = t.intersection([
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
export type Plugin = t.TypeOf<typeof Plugin>;

export const PluginRegistration = t.union([
	t.string,
	Plugin,
	t.intersection([
		t.type({
			resolve: t.union([t.string, Plugin]),
		}),
		t.partial({
			options: t.UnknownRecord,
		}),
	]),
]);
export type PluginRegistration = t.TypeOf<typeof PluginRegistration>;

export const SliceMachineConfig = t.intersection([
	t.type({
		repositoryName: t.string,
		adapter: PluginRegistration,
	}),
	t.partial({
		libraries: t.array(t.string),
		localSliceSimulatorURL: t.string,
		plugins: t.array(PluginRegistration),
	}),
]);
export type SliceMachineConfig = t.TypeOf<typeof SliceMachineConfig>;

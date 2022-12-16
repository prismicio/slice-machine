import * as t from "io-ts";

import { SliceMachineConfig } from "../types";

import { DecodeReturnType, decode } from "./decode";
import { functionCodec } from "./functionCodec";

const SliceMachinePluginCodec = t.intersection([
	t.type({
		meta: t.type({
			name: t.string,
		}),
		setup: functionCodec,
	}),
	t.partial({
		defaultOptions: t.UnknownRecord,
	}),
]);

const SliceMachineConfigPluginRegistrationCodec = t.union([
	t.string,
	SliceMachinePluginCodec,
	t.intersection([
		t.type({
			resolve: t.union([t.string, SliceMachinePluginCodec]),
		}),
		t.partial({
			options: t.UnknownRecord,
		}),
	]),
]);

const SliceMachineConfigCodec = t.intersection([
	t.type({
		_latest: t.string,
		repositoryName: t.string,
		adapter: SliceMachineConfigPluginRegistrationCodec,
	}),
	t.partial({
		apiEndpoint: t.string,
		libraries: t.array(t.string),
		localSliceSimulatorURL: t.string,
		plugins: t.array(SliceMachineConfigPluginRegistrationCodec),
	}),
]);

// TODO: Maybe rename "decode" to "validate". "decode" exposes the `io-ts`
// internals.
export const decodeSliceMachineConfig = (
	input: unknown,
): DecodeReturnType<SliceMachineConfig, SliceMachineConfig, unknown> => {
	return decode(SliceMachineConfigCodec, input) as DecodeReturnType<
		SliceMachineConfig,
		SliceMachineConfig,
		unknown
	>;
};

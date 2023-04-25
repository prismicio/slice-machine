import * as t from "io-ts";

import { SliceMachineConfig } from "../types";

import { decode, DecodeReturnType } from "./decode";

const SliceMachineConfigPluginRegistrationCodec = t.union([
	t.string,
	t.intersection([
		t.type({
			resolve: t.string,
		}),
		t.partial({
			options: t.UnknownRecord,
		}),
	]),
]);

const SliceMachineConfigCodec = t.intersection([
	t.type({
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
	return decode(SliceMachineConfigCodec, input);
};

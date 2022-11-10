import * as t from "io-ts";
import { SliceMachineConfig as SliceMachineConfigCodec } from "../types";
import { decode, DecodeReturnType } from "./decode";

const FunctionCodec = new t.Type<
	// eslint-disable-next-line @typescript-eslint/ban-types
	Function,
	// eslint-disable-next-line @typescript-eslint/ban-types
	Function,
	unknown
>(
	"function",
	// eslint-disable-next-line @typescript-eslint/ban-types
	(input: unknown): input is Function => typeof input === "function",
	(input, context) =>
		typeof input === "function" ? t.success(input) : t.failure(input, context),
	t.identity,
);

const SliceMachinePluginCodec = t.intersection([
	t.type({
		meta: t.type({
			name: t.string,
		}),
		setup: FunctionCodec,
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
): DecodeReturnType<
	SliceMachineConfigCodec,
	SliceMachineConfigCodec,
	unknown
> => {
	return decode(SliceMachineConfigCodec, input) as DecodeReturnType<
		SliceMachineConfigCodec,
		SliceMachineConfigCodec,
		unknown
	>;
};

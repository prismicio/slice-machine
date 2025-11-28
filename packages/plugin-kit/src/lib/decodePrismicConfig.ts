import * as t from "io-ts";

import { PrismicConfig } from "../types";

import { decode, DecodeReturnType } from "./decode";

const PrismicConfigPluginRegistrationCodec = t.union([
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

const PrismicConfigCodec = t.intersection([
	t.type({
		repositoryName: t.string,
		adapter: PrismicConfigPluginRegistrationCodec,
	}),
	t.partial({
		apiEndpoint: t.string,
		libraries: t.array(t.string),
	}),
]);

export const decodePrismicConfig = (
	input: unknown,
): DecodeReturnType<PrismicConfig, PrismicConfig, unknown> => {
	return decode(PrismicConfigCodec, input);
};

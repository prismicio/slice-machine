import * as z from "zod";

import { PrismicConfig } from "../types";

import { decode, DecodeReturnType } from "./decode";

const PrismicConfigPluginRegistrationSchema = z.union([
	z.string(),
	z.object({
		resolve: z.string(),
		options: z.record(z.string(), z.unknown()).optional(),
	}),
]);

const PrismicConfigSchema = z.object({
	repositoryName: z.string(),
	adapter: PrismicConfigPluginRegistrationSchema,
	apiEndpoint: z.string().optional(),
	libraries: z.array(z.string()).optional(),
});

export const decodePrismicConfig = (
	input: unknown,
): DecodeReturnType<PrismicConfig, PrismicConfig, unknown> => {
	return decode(PrismicConfigSchema, input);
};

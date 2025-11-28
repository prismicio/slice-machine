import * as z from "zod";

import { decode, DecodeReturnType } from "./decode";

/**
 * A minimally defined schema for package.json files. Only data needed for
 * version detection is defined.
 */
const PackageJSONSchema = z.object({
	version: z.string(),
});
type PackageJSON = z.infer<typeof PackageJSONSchema>;

export const decodePackageJSON = (
	input: unknown,
): DecodeReturnType<PackageJSON, PackageJSON, unknown> => {
	return decode(PackageJSONSchema, input);
};

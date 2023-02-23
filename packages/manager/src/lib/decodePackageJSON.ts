import * as t from "io-ts";

import { decode, DecodeReturnType } from "./decode";

/**
 * A minimally defined codec for package.json files. Only data needed for
 * version detection is defined.
 */
const PackageJSONCodec = t.type({
	version: t.string,
});
type PackageJSON = t.TypeOf<typeof PackageJSONCodec>;

export const decodePackageJSON = (
	input: unknown,
): DecodeReturnType<PackageJSON, PackageJSON, unknown> => {
	return decode(PackageJSONCodec, input);
};

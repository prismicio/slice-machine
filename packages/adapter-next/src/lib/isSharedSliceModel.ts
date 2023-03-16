import * as prismicT from "@prismicio/types";

export const isSharedSliceModel = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
	input: any,
): input is prismicT.SharedSliceModel => {
	return (
		typeof input === "object" &&
		input !== null &&
		"type" in input &&
		input.type === prismicT.CustomTypeModelSliceType.SharedSlice &&
		typeof input.id === "string"
	);
};

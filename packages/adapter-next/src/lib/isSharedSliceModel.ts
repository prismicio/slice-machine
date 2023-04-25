import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

export const isSharedSliceModel = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
	input: any,
): input is SharedSlice => {
	return (
		typeof input === "object" &&
		input !== null &&
		"type" in input &&
		input.type === "SharedSlice" &&
		typeof input.id === "string"
	);
};

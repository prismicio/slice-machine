import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

export function isSharedSliceModel(input: unknown): input is SharedSlice {
	return (
		typeof input === "object" &&
		input !== null &&
		"type" in input &&
		input.type === "SharedSlice" &&
		"id" in input &&
		typeof input.id === "string"
	);
}

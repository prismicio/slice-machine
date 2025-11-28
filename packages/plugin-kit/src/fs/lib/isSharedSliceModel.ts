import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

export function isSharedSliceModel(
	input: unknown,
): input is TypesInternal.SharedSlice {
	return (
		typeof input === "object" &&
		input !== null &&
		"type" in input &&
		input.type === "SharedSlice" &&
		"id" in input &&
		typeof input.id === "string"
	);
}

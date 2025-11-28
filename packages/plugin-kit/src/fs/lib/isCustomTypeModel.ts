import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

export function isCustomTypeModel(
	input: unknown,
): input is TypesInternal.CustomType {
	return typeof input === "object" && input !== null && "json" in input;
}

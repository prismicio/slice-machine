import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

export function isCustomTypeModel(input: unknown): input is CustomType {
	return typeof input === "object" && input !== null && "json" in input;
}

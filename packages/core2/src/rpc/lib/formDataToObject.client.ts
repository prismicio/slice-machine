import { deserialize } from "./deserialize";
import { unflattenObject } from "./unflattenObject";

export const formDataToObject = (
	formData: FormData,
): Record<string, unknown> => {
	const flattenedObject = {} as Record<string, unknown>;

	for (const [key, value] of formData) {
		if (typeof value === "string") {
			flattenedObject[key] = deserialize(value);
		} else {
			flattenedObject[key] = value;
		}
	}

	return unflattenObject(flattenedObject);
};

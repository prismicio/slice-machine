import { deserialize } from "./deserialize";
import { unflattenObject } from "./unflattenObject";

export const clientFormDataToObject = (
	formData: FormData,
): Record<string, unknown> => {
	const flattenedObject = {} as Record<string, unknown>;

	for (const [key, value] of formData) {
		if (value instanceof Blob) {
			flattenedObject[key] = value;
		} else {
			flattenedObject[key] = deserialize(value);
		}
	}

	return unflattenObject(flattenedObject);
};

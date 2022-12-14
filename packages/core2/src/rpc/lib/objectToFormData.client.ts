import { flattenObject } from "./flattenObject";
import { serialize } from "./serialize";

export const objectToFormData = (obj: Record<string, unknown>): FormData => {
	const formData = new FormData();

	const flattenedObject = flattenObject(obj);

	for (const key in flattenedObject) {
		const value = flattenedObject[key as keyof typeof obj];

		if (value instanceof Blob) {
			formData.set(key, value);
		} else {
			formData.set(key, serialize(value));
		}
	}

	return formData;
};

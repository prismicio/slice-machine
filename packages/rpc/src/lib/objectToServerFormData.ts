import { Buffer } from "node:buffer";
import { FormData, Blob } from "node-fetch";

import { flattenObject } from "./flattenObject";
import { serialize } from "./serialize";

export const objectToServerFormData = (
	obj: Record<string, unknown> | undefined,
): FormData => {
	const formData = new FormData();

	if (obj) {
		const flattenedObject = flattenObject(obj);

		for (const key in flattenedObject) {
			const value = flattenedObject[key as keyof typeof obj];

			if (Buffer.isBuffer(value)) {
				formData.set(key, new Blob([value]));
			} else {
				formData.set(key, serialize(value));
			}
		}
	}

	return formData;
};

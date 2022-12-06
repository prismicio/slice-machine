import { Readable } from "node:stream";
import { FormDataEncoder, FormDataLike } from "form-data-encoder";
import { H3Event, sendStream, setHeaders } from "h3";

export const sendFormData = (
	event: H3Event,
	formData: FormDataLike,
): Promise<void> => {
	const encoder = new FormDataEncoder(formData);

	// The encoder provides necessary headings, including
	// the correct `multipart/form-data` `boundary` value.
	setHeaders(event, encoder.headers);

	// The encoded value must be converted to a stream.
	return sendStream(event, Readable.from(encoder.encode()));
};

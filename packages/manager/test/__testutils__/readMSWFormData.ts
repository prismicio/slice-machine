import parseMultipartFormData from "parse-multipart-data";
import { RestRequest } from "msw";

type FormDataField =
	| { data: Buffer; type: string; filename?: string }
	| { data: string };

export const readMSWFormData = async (
	req: RestRequest,
): Promise<Record<string, FormDataField>> => {
	const contentType = req.headers.get("Content-Type");

	if (contentType == null) {
		throw new Error(
			"readMSWFormData can only be used on requests that have a `Content-Type` header. This request did not contain one.",
		);
	}

	const boundary = parseMultipartFormData.getBoundary(contentType);
	const parsedData = parseMultipartFormData.parse(
		Buffer.from(await req.text()),
		boundary,
	);

	const res: Record<string, FormDataField> = {};

	for (const input of parsedData) {
		if (input.name) {
			if ("filename" in input) {
				res[input.name] = {
					data: input.data,
					filename: input.filename,
					type: input.type,
				};
			} else {
				res[input.name] = {
					data: input.data.toString(),
				};
			}
		}
	}

	return res;
};

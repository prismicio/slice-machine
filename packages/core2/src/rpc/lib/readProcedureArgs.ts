import { Buffer } from "node:buffer";
import { H3Event, getHeaders } from "h3";
import busboy from "busboy";

import { deserialize } from "./deserialize";

export const readProcedureArgs = <
	TProcedureArgs extends Record<string, unknown>,
>(
	event: H3Event,
): Promise<TProcedureArgs> => {
	return new Promise((resolve, reject) => {
		const headers = getHeaders(event);

		const bb = busboy({ headers });

		const args = {} as TProcedureArgs;

		bb.on("file", (name, file, _info) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const chunks: any[] = [];

			file.on("data", (data) => {
				chunks.push(data);
			});

			file.on("close", () => {
				args[name as keyof typeof args] = Buffer.concat(
					chunks,
				) as TProcedureArgs[keyof TProcedureArgs];
			});
		});

		bb.on("field", (name, value, _info) => {
			args[name as keyof typeof args] = deserialize(value);
		});

		bb.on("close", () => {
			resolve(args);
		});

		bb.on("error", (error) => {
			reject(error);
		});

		event.req.pipe(bb);
	});
};

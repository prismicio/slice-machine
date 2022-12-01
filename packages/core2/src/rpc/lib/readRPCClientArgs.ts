import { H3Event, getHeaders } from "h3";
import { Buffer } from "node:buffer";
import busboy from "busboy";
import util from "util";

import { ProcedureCallServerArgs } from "../types";

import { deserialize } from "./deserialize";
import { unflattenObject } from "./unflattenObject";

export const readRPCClientArgs = (
	event: H3Event,
): Promise<ProcedureCallServerArgs> => {
	return new Promise((resolve, reject) => {
		const headers = getHeaders(event);

		const bb = busboy({ headers });

		const args = {} as Record<string, unknown>;

		bb.on("file", (name, file, _info) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const chunks: any[] = [];

			file.on("data", (data) => {
				chunks.push(data);
			});

			file.on("close", () => {
				args[name as keyof typeof args] = Buffer.concat(chunks);
			});
		});

		bb.on("field", (name, value, _info) => {
			args[name as keyof typeof args] = deserialize(value);
		});

		bb.on("close", () => {
			const unflattenedArgs = unflattenObject(args) as ProcedureCallServerArgs;

			resolve(unflattenedArgs);
		});

		bb.on("error", (error) => {
			reject(error);
		});

		event.req.pipe(bb);
	});
};

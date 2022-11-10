import { createServer, Server } from "node:http";
import { AddressInfo } from "node:net";
import { Buffer } from "node:buffer";
import {
	createApp,
	toNodeListener,
	eventHandler,
	H3Event,
	getHeaders,
} from "h3";
import busboy from "busboy";

import { deserialize } from "./lib/deserialize";
import { serialize } from "./lib/serialize";

import { ProcedureCallServerReturnType, Procedures } from "./types";

const readProcedureArgs = <TProcedureArgs extends Record<string, unknown>>(
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

export type CreateRPCServerArgs<TProcedures extends Procedures> = {
	procedures: TProcedures;
	basePath?: string;
};

export const createRPCServer = <TProcedures extends Procedures>(
	args: CreateRPCServerArgs<TProcedures>,
): RPCServer<TProcedures> => {
	return new RPCServer(args);
};

export type RPCServerStartArgs = {
	port?: number;
};

export type RPCServerStartReturnType = {
	port: number;
};

export type RCPServerConstructorArgs<TProcedures extends Procedures> = {
	procedures: TProcedures;
	basePath?: string;
};

export class RPCServer<TProcedures extends Procedures> {
	private _procedures: TProcedures;
	private _basePath?: string;
	private _server: Server;

	constructor(args: RCPServerConstructorArgs<TProcedures>) {
		this._procedures = args.procedures;
		this._basePath = this._basePath;
		this._server = this._createServer();
	}

	open({ port }: RPCServerStartArgs = {}): Promise<AddressInfo> {
		return new Promise((resolve) => {
			this._server.once("listening", () => {
				resolve(this._server.address() as AddressInfo);
			});

			this._server.listen({ port });
		});
	}

	close(): Promise<void> {
		return new Promise((resolve) => {
			this._server.once("close", resolve);

			this._server.close();
		});
	}

	private _createServer(): Server {
		const app = createApp();

		for (const name in this._procedures) {
			const procedure = this._procedures[name];
			const route = this._basePath ? `${this._basePath}/${name}` : name;

			app.use(
				route,
				eventHandler(async (event): Promise<ProcedureCallServerReturnType> => {
					const procedureArgs = await readProcedureArgs(event);

					const res = await procedure(procedureArgs);

					try {
						const data = serialize(res);

						return {
							data,
						};
					} catch (error) {
						if (error instanceof Error) {
							event.req.statusCode = 500;

							return {
								error: "Unable to serialize server response.",
								cause: error,
							};
						} else {
							throw error;
						}
					}
				}),
			);
		}

		return createServer(toNodeListener(app));
	}
}

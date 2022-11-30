import {
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	getRouterParam,
	NodeMiddleware,
} from "h3";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";

import { readRPCClientArgs } from "./lib/readRPCClientArgs";
import { serialize } from "./lib/serialize";

import { Procedure, ProcedureCallServerReturnType, Procedures } from "./types";

const TMP_ASSETS_DIRECTORY_NAME = "rpc-public-buffers";

export type RPCMiddleware<TProcedures extends Procedures> = NodeMiddleware & {
	_procedures: TProcedures;
};

/**
 * Creates a content digest for a given input.
 *
 * @param input - The value used to create a digest digest.
 *
 * @returns The content digest of `input`.
 */
const toContentDigest = (input: crypto.BinaryLike): string => {
	return crypto.createHash("sha1").update(input).digest("base64");
};

/**
 * Returns an absolute file path for a publicly accessible buffer.
 *
 * @param contentDigest - A buffer's content digest. The digest is used as a
 *   file identifier.
 *
 * @returns Absolute file path to the publicly accessible buffer.
 */
const buildPublicBufferFilePath = (contentDigest: string): string => {
	return path.join(os.tmpdir(), TMP_ASSETS_DIRECTORY_NAME, contentDigest);
};

/**
 * Returns a relative URL for a publicly accessible buffer. The URL is relative
 * to the RPC middleware's root.
 *
 * @param contentDigest - A buffer's content digest. The digest is used as a
 *   file identifier.
 *
 * @returns Relative URL to the publicly accessible buffer.
 */
const buildPublicBufferURL = <TContentDigest extends string>(
	contentDigest: TContentDigest,
): `/buffer/${TContentDigest}` => {
	return `/buffer/${contentDigest}` as const;
};

const prepareForSerialization = async (input: unknown): Promise<unknown> => {
	if (input instanceof Buffer) {
		const contentDigest = toContentDigest(input);
		const filePath = buildPublicBufferFilePath(contentDigest);

		await fs.mkdir(path.dirname(filePath), { recursive: true });

		// Check if the temporary file already exists.
		// If it doesn't, write the file.
		try {
			await fs.access(filePath);
		} catch {
			await fs.writeFile(filePath, input);
		}

		return { url: buildPublicBufferURL(contentDigest) };
	} else if (input instanceof Error) {
		return {
			name: input.name,
			message: input.message,
		};
	} else if (Array.isArray(input)) {
		return await Promise.all(
			input.map(async (element) => {
				return await prepareForSerialization(element);
			}),
		);
	} else if (typeof input === "object" && input !== null) {
		return Object.fromEntries(
			await Promise.all(
				Object.entries(input).map(async ([key, value]) => {
					return [key, await prepareForSerialization(value)];
				}),
			),
		);
	} else {
		return input;
	}
};

type FindProcedureArgs = {
	path: string[];
	procedures: Procedures;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findProcedure = (args: FindProcedureArgs): Procedure<any> | undefined => {
	// Use a clone to prevent unwanted mutations.
	const path = [...args.path];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let proceduresPointer: Procedures | Procedure<any> = args.procedures;

	while (path.length > 0) {
		const pathSegment = path.shift();

		if (pathSegment === undefined) {
			return;
		}

		proceduresPointer = proceduresPointer[pathSegment];

		if (typeof proceduresPointer === "function") {
			return proceduresPointer;
		} else if (proceduresPointer === undefined) {
			return;
		}
	}
};

export type CreateRPCRouterArgs<TProcedures extends Procedures> = {
	procedures: TProcedures;
};

export const createRPCMiddleware = <TProcedures extends Procedures>(
	args: CreateRPCRouterArgs<TProcedures>,
): RPCMiddleware<TProcedures> => {
	const router = createRouter();

	router.post(
		"/",
		eventHandler(async (event): Promise<ProcedureCallServerReturnType> => {
			const clientArgs = await readRPCClientArgs(event);

			const procedure = findProcedure({
				path: clientArgs.procedurePath,
				procedures: args.procedures,
			});

			if (!procedure) {
				throw new Error(
					`Invalid procedure name: ${clientArgs.procedurePath.join(".")}`,
				);
			}

			let res: unknown;

			try {
				res = await procedure(clientArgs.procedureArgs);
			} catch (error) {
				if (error instanceof Error) {
					event.req.statusCode = 500;

					return {
						error: error.message,
						cause: error,
					};
				} else {
					throw error;
				}
			}

			// TODO: Send `res` back as FormData. This lets us send
			// back binary as Blobs, negating the need for
			// `prepareForSerialization` and the "public buffer"
			// tmp endpoints.

			try {
				const preparedRes = await prepareForSerialization(res);
				const data = serialize(preparedRes);

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

	router.get(
		buildPublicBufferURL(":contentDigest"),
		eventHandler(async (event) => {
			const contentDigest = getRouterParam(event, "contentDigest") as string;
			const filePath = buildPublicBufferFilePath(contentDigest);

			return await fs.readFile(filePath);
		}),
	);

	const middleware = defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		return await router.handler(event);
	}) as RPCMiddleware<TProcedures>;

	middleware._procedures = args.procedures;

	return middleware;
};

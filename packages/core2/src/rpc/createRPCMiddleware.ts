import {
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	NodeMiddleware,
} from "h3";

import { isErrorLike } from "./lib/isErrorLike";
import { objectToFormData } from "./lib/objectToFormData.server";
import { readRPCClientArgs } from "./lib/readRPCClientArgs";
import { sendFormData } from "./lib/sendFormData";

import { Procedure, Procedures } from "./types";

export type RPCMiddleware<TProcedures extends Procedures> = NodeMiddleware & {
	_procedures: TProcedures;
};

const findProcedure = (
	procedures: Procedures,
	path: string[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Procedure<any> | undefined => {
	// Use a clone to prevent unwanted mutations.
	path = [...path];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let proceduresPointer: Procedures | Procedure<any> = procedures;

	while (path.length > 0) {
		const pathSegment = path.shift();

		if (pathSegment) {
			proceduresPointer = proceduresPointer[pathSegment];

			if (typeof proceduresPointer === "function") {
				return proceduresPointer;
			} else if (proceduresPointer === undefined) {
				return;
			}
		}
	}
};

export type CreateRPCMiddlewareArgs<TProcedures extends Procedures> = {
	procedures: TProcedures;
};

export const createRPCMiddleware = <TProcedures extends Procedures>(
	args: CreateRPCMiddlewareArgs<TProcedures>,
): RPCMiddleware<TProcedures> => {
	const router = createRouter();

	router.post(
		"/",
		eventHandler(async (event): Promise<void> => {
			const clientArgs = await readRPCClientArgs(event);

			const procedure = findProcedure(
				args.procedures,
				clientArgs.procedurePath,
			);

			if (!procedure) {
				throw new Error(
					`Invalid procedure name: ${clientArgs.procedurePath.join(".")}`,
				);
			}

			let res: unknown;

			try {
				res = await procedure(clientArgs.procedureArgs);
			} catch (error) {
				if (isErrorLike(error)) {
					const formData = objectToFormData({
						error: {
							name: error.name,
							message: error.message,
							stack:
								process.env.NODE_ENV === "development"
									? error.stack
									: undefined,
						},
					});

					event.res.statusCode = 500;

					return await sendFormData(event, formData);
				}

				throw error;
			}

			try {
				const formData = objectToFormData({
					data: res,
				});

				return await sendFormData(event, formData);
			} catch (error) {
				if (error instanceof Error) {
					console.error(error);

					const formData = objectToFormData({
						error: {
							name: "RPCError",
							message:
								"Unable to serialize server response. Check the server log for details.",
						},
					});

					event.req.statusCode = 500;

					return await sendFormData(event, formData);
				}

				throw error;
			}
		}),
	);

	return defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		return await router.handler(event);
	}) as RPCMiddleware<TProcedures>;
};

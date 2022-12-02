import {
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	NodeMiddleware,
} from "h3";

import { objectToServerFormData } from "./lib/objectToServerFormData";
import { readRPCClientArgs } from "./lib/readRPCClientArgs";
import { sendFormData } from "./lib/sendFormData";

import { Procedure, Procedures } from "./types";

export type RPCMiddleware<TProcedures extends Procedures> = NodeMiddleware & {
	_procedures: TProcedures;
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
		eventHandler(async (event): Promise<void> => {
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
					console.error(error);

					const formData = objectToServerFormData({
						error: error.message,
						cause: error,
					});

					event.res.statusCode = 500;

					return await sendFormData(event, formData);
				} else {
					throw error;
				}
			}

			try {
				const formData = objectToServerFormData({
					data: res,
				});

				return await sendFormData(event, formData);
			} catch (error) {
				if (error instanceof Error) {
					const formData = objectToServerFormData({
						error: "Unable to serialize server response.",
						cause: error,
					});

					event.req.statusCode = 500;

					return await sendFormData(event, formData);
				} else {
					throw error;
				}
			}
		}),
	);

	const middleware = defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		return await router.handler(event);
	}) as RPCMiddleware<TProcedures>;

	middleware._procedures = args.procedures;

	return middleware;
};

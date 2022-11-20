import {
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	NodeMiddleware,
	Router,
} from "h3";

import { readProcedureArgs } from "./lib/readProcedureArgs";
import { serialize } from "./lib/serialize";

import { ProcedureCallServerReturnType, Procedures } from "./types";

export type RPCMiddleware<TProcedures extends Procedures> = NodeMiddleware & {
	_procedures: TProcedures;
};

type AddProceduresFromObjectArgs<TProcedures extends Procedures> = {
	procedures: TProcedures;
	router: Router;
	path?: string[];
};

const addProceduresToRouter = <TProcedures extends Procedures>(
	args: AddProceduresFromObjectArgs<TProcedures>,
): void => {
	for (const name in args.procedures) {
		const procedure = args.procedures[name];

		if (typeof procedure === "object") {
			addProceduresToRouter({
				...args,
				procedures: procedure,
				path: [...(args.path || []), name],
			});
		} else {
			const route = "/" + [...(args.path || []), name].join("/");

			args.router.post(
				route,
				eventHandler(async (event): Promise<ProcedureCallServerReturnType> => {
					const procedureArgs = await readProcedureArgs(event);

					const res = await procedure(procedureArgs);

					// TODO: Convert Buffers to tmp files.
					// Expose a special `/tmp` endpoint to
					// read the temporary files.

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
	}
};

export type CreateRPCRouterArgs<TProcedures extends Procedures> = {
	procedures: TProcedures;
};

export const createRPCMiddleware = <TProcedures extends Procedures>(
	args: CreateRPCRouterArgs<TProcedures>,
): RPCMiddleware<TProcedures> => {
	const router = createRouter();

	addProceduresToRouter({
		procedures: args.procedures,
		router,
	});

	const middleware = defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		return await router.handler(event);
	}) as RPCMiddleware<TProcedures>;

	middleware._procedures = args.procedures;

	return middleware;
};

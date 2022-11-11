import {
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	NodeMiddleware,
} from "h3";

import { readProcedureArgs } from "./lib/readProcedureArgs";
import { serialize } from "./lib/serialize";

import { ProcedureCallServerReturnType, Procedures } from "./types";

export type CreateRPCRouterArgs<TProcedures extends Procedures> = {
	procedures: TProcedures;
};

export const createRPCMiddleware = <TProcedures extends Procedures>(
	args: CreateRPCRouterArgs<TProcedures>,
): NodeMiddleware => {
	const router = createRouter();

	for (const name in args.procedures) {
		const procedure = args.procedures[name];

		router.post(
			`/${name}`,
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

	return defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		return await router.handler(event);
	});
};

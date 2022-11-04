import { deserialize } from "./lib/deserialize";
import { serialize } from "./lib/serialize";

import { ProcedureCallServerReturnType, Procedures, Procedure } from "./types";

// `RPCClient` is currently a clone of `TransformProcedures`, but that could
// change in the future.
export type RPCClient<TProcedures extends Procedures> =
	TransformProcedures<TProcedures>;

type TransformProcedures<TProcedures extends Procedures> = {
	[P in keyof TProcedures]: TransformProcedure<TProcedures[P]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransformProcedure<TProcedure extends Procedure<any>> = (
	...args: Parameters<TProcedure> extends []
		? []
		: [TransformProcedureArgs<Parameters<TProcedure>[0]>]
) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
ReturnType<TProcedure> extends Promise<any>
	? ReturnType<TProcedure>
	: Promise<ReturnType<TProcedure>>;

type TransformProcedureArgs<TArgs extends Record<string, unknown>> = {
	[P in keyof TArgs]: TArgs[P] extends Buffer ? Blob : TArgs[P];
};

export type ResponseLike = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any>;
};
export type FetchLike = (
	input: string,
	init: { method: "POST"; body: FormData },
) => Promise<ResponseLike>;

export type CreateRPCClientArgs = {
	serverURL: string;
	fetch?: FetchLike;
};

export const createRPCClient = <TProcedures extends Procedures>(
	args: CreateRPCClientArgs,
): RPCClient<TProcedures> => {
	const resolvedFetch = args.fetch || globalThis.fetch.bind(globalThis);

	const client = {} as TransformProcedures<TProcedures>;

	return new Proxy(client, {
		get(_, procedureName) {
			return async (procedureArgs?: Record<string, unknown>) => {
				const formData = new FormData();
				for (const procedureArgName in procedureArgs) {
					const procedureArg =
						procedureArgs[procedureArgName as keyof typeof procedureArgs];

					if (procedureArg instanceof Blob) {
						formData.set(procedureArgName, procedureArg);
					} else {
						formData.set(procedureArgName, serialize(procedureArg));
					}
				}

				const url = `${args.serverURL}/${procedureName.toString()}`;
				const res = await resolvedFetch(url, {
					method: "POST",
					body: formData,
				});

				const json = (await res.json()) as ProcedureCallServerReturnType;

				if ("data" in json) {
					return deserialize(json.data);
				} else {
					throw new Error(json.error, {
						cause: json.cause,
					});
				}
			};
		},
	});
};

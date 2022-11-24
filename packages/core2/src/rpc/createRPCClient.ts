import { coerceTrailingSlash } from "./lib/coerceTrailingSlash";
import { deserialize } from "./lib/deserialize";
import { serialize } from "./lib/serialize";

import { ProcedureCallServerReturnType, Procedures, Procedure } from "./types";

const createArbitrarilyNestedFunction = <T>(
	handler: (path: string[], args: unknown[]) => unknown,
	path: string[] = [],
): T => {
	return new Proxy(() => void 0, {
		apply(_target, _this, args) {
			return handler(path, args);
		},
		get(_target, property) {
			return createArbitrarilyNestedFunction(handler, [
				...path,
				property.toString(),
			]);
		},
	}) as T;
};

// `RPCClient` is currently a clone of `TransformProcedures`, but that could
// change in the future.
export type RPCClient<TProcedures extends Procedures> =
	TransformProcedures<TProcedures>;

type TransformProcedures<TProcedures> =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TProcedures extends Procedures
		? { [P in keyof TProcedures]: TransformProcedures<TProcedures[P]> }
		: // eslint-disable-next-line @typescript-eslint/no-explicit-any
		TProcedures extends Procedure<any>
		? TransformProcedure<TProcedures>
		: TProcedures;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransformProcedure<TProcedure extends Procedure<any>> = (
	...args: Parameters<TProcedure> extends []
		? []
		: [TransformProcedureArgs<Parameters<TProcedure>[0]>]
) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
ReturnType<TProcedure> extends Promise<any>
	? TransformProcedureReturnType<ReturnType<TProcedure>>
	: TransformProcedureReturnType<Promise<ReturnType<TProcedure>>>;

type TransformProcedureArgs<TArgs> = TArgs extends Record<string, unknown>
	? {
			[P in keyof TArgs]: TransformProcedureArgs<TArgs[P]>;
	  }
	: TArgs extends Buffer
	? Blob
	: TArgs;

type TransformProcedureReturnType<TReturnType> = TReturnType extends
	| Record<string, unknown>
	| unknown[]
	? {
			[P in keyof TReturnType]: TransformProcedureReturnType<TReturnType[P]>;
	  }
	: TReturnType extends Buffer
	? {
			url: string;
	  }
	: TReturnType extends Error
	? {
			name: string;
			message: string;
	  }
	: TReturnType;

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
	const resolvedFetch: FetchLike =
		args.fetch || globalThis.fetch.bind(globalThis);

	return createArbitrarilyNestedFunction(async (path, fnArgs) => {
		const procedureArgs = fnArgs[0] as Record<string, unknown>;

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

		const url = coerceTrailingSlash(args.serverURL) + path.join("/");
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
	});
};

import { RPCServer } from "./createRPCServer";

export type Procedures = Record<
	string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Procedure<any>
>;

export type Procedure<TArgs extends Record<string, unknown>> = (
	args: TArgs,
) => unknown | Promise<unknown>;

export type ProcedureCallServerReturnType =
	| {
			data: string;
	  }
	| {
			error: string;
			cause: unknown;
	  };

export type ExtractProcedures<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TRPCServer extends RPCServer<Procedures>,
> = TRPCServer extends RPCServer<infer TProcedures> ? TProcedures : never;

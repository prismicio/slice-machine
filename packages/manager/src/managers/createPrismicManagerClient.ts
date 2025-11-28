import { createRPCClient, CreateRPCClientArgs, RPCClient } from "r19/client";

// !!! Never import anything other than types from
// !!! `./createPrismicManagerServer` in this file.
import type { PrismicManagerProcedures } from "./createPrismicManagerMiddleware";

export type PrismicManagerClient = RPCClient<PrismicManagerProcedures>;

export type CreatePrismicManagerClientArgs = {
	serverURL: CreateRPCClientArgs["serverURL"];
	fetch?: NonNullable<CreateRPCClientArgs["fetch"]>;
};

export const createPrismicManagerClient = (
	args: CreatePrismicManagerClientArgs,
): PrismicManagerClient => {
	return createRPCClient({
		serverURL: args.serverURL,
		fetch: args.fetch,
	});
};

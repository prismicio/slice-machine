// TODO: Fix r19 to allow importing from `r19/client`
import { createRPCClient, CreateRPCClientArgs, RPCClient } from "r19/client";

// !!! Never import anything other than types from
// !!! `./createSliceMachineManagerServer` in this file.
import type { SliceMachineManagerProcedures } from "./createSliceMachineManagerMiddleware";

export type SliceMachineManagerClient =
	RPCClient<SliceMachineManagerProcedures>;

export type CreateSliceMachineManagerClientArgs = {
	serverURL: CreateRPCClientArgs["serverURL"];
	fetch?: NonNullable<CreateRPCClientArgs["fetch"]>;
};

export const createSliceMachineManagerClient = (
	args: CreateSliceMachineManagerClientArgs,
): SliceMachineManagerClient => {
	return createRPCClient({
		serverURL: args.serverURL,
		fetch: args.fetch,
	});
};

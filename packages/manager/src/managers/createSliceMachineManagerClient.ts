import { RPCClient, createRPCClient } from "r19/client";

// !!! Never import anything other than types from
// !!! `./createSliceMachineManagerServer` in this file.
import type { SliceMachineManagerProcedures } from "./createSliceMachineManagerMiddleware";

export type SliceMachineManagerClient =
	RPCClient<SliceMachineManagerProcedures>;

export type CreateSliceMachineManagerClientArgs = {
	serverURL: string;
};

export const createSliceMachineManagerClient = (
	args: CreateSliceMachineManagerClientArgs,
): SliceMachineManagerClient => {
	return createRPCClient({
		serverURL: args.serverURL,
	});
};

import { createRPCClient, ExtractProcedures, RPCClient } from "./rpc";

// !!! Never import anything other than types from
// !!! `./createSliceMachineManagerServer` in this file.
import type { SliceMachineManagerServer } from "./createSliceMachineManagerServer";

export type SliceMachineManagerClient = RPCClient<
	ExtractProcedures<SliceMachineManagerServer>
>;

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

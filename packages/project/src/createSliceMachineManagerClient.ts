import {
	createRPCClient,
	ExtractProcedures,
	RPCClient,
} from "@slicemachine/rpc";

// !!! Never import anything other than types from
// !!! `./createSliceMachineManagerServer` in this file.
import type { SliceMachineManagerMiddleware } from "./createSliceMachineManagerMiddleware";

export type SliceMachineManagerClient = RPCClient<
	ExtractProcedures<SliceMachineManagerMiddleware>
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

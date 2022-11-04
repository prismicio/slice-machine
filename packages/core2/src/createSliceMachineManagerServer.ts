import { SliceMachineManager } from "./createSliceMachineManager";
import {
	ProceduresFromInstance,
	RPCServer,
	createRPCServer,
	proceduresFromInstance,
} from "./rpc";

export type SliceMachineManagerServer = RPCServer<
	ProceduresFromInstance<SliceMachineManager>
>;

export type CreateSliceMachineManagerServerArgs = {
	manager: SliceMachineManager;
};

export const createSliceMachineManagerServer = (
	args: CreateSliceMachineManagerServerArgs,
): SliceMachineManagerServer => {
	return createRPCServer({
		procedures: proceduresFromInstance(args.manager),
	});
};

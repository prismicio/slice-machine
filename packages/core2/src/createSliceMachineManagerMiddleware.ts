import { NodeMiddleware } from "h3";

import { SliceMachineManager } from "./createSliceMachineManager";
import {
	ProceduresFromInstance,
	RPCMiddleware,
	proceduresFromInstance,
	createRPCMiddleware,
} from "./rpc";

export type SliceMachineManagerMiddleware = RPCMiddleware<
	ProceduresFromInstance<SliceMachineManager>
>;

export type CreateSliceMachineManagerMiddlewareArgs = {
	sliceMachineManager: SliceMachineManager;
};

export const createSliceMachineManagerMiddleware = (
	args: CreateSliceMachineManagerMiddlewareArgs,
): NodeMiddleware => {
	return createRPCMiddleware({
		procedures: proceduresFromInstance(args.sliceMachineManager),
	});
};

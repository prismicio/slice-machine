import { NodeMiddleware } from "h3";

import { SliceMachineManager } from "./createSliceMachineManager";
import {
	ProceduresFromInstance,
	RPCServer,
	proceduresFromInstance,
	createRPCMiddleware,
} from "./rpc";

export type SliceMachineManagerServer = RPCServer<
	ProceduresFromInstance<SliceMachineManager>
>;

export type CreateSliceMachineManagerMiddlewareArgs = {
	manager: SliceMachineManager;
};

export const createSliceMachineManagerMiddleware = (
	args: CreateSliceMachineManagerMiddlewareArgs,
): NodeMiddleware => {
	return createRPCMiddleware({
		procedures: proceduresFromInstance(args.manager),
	});
};

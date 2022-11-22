import { NodeMiddleware } from "h3";

import {
	ProceduresFromInstance,
	RPCMiddleware,
	proceduresFromInstance,
	createRPCMiddleware,
} from "../rpc";

import { SliceMachineManager } from "./SliceMachineManager";

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
		procedures: proceduresFromInstance(args.sliceMachineManager, {
			omit: [
				// @ts-expect-error - Purposely omitting a private property.
				args.sliceMachineManager._sliceMachinePluginRunner,

				// @ts-expect-error - Purposely omitting a private property.
				args.sliceMachineManager._prismicAuthManager,

				// Any child manager could be used here to omit
				// the shared SliceMachineManager, but we
				// selected `user` since that manager should
				// exist forever.
				// @ts-expect-error - Purposely omitting a private property.
				args.sliceMachineManager.user._sliceMachineManager,

				args.sliceMachineManager.getSliceMachinePluginRunner,
				args.sliceMachineManager.getPrismicAuthManager,
			],
		}),
	});
};

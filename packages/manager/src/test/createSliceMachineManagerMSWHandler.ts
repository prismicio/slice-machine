import { handleRPCRequest } from "r19";
import { rest, DefaultBodyType, MockedRequest, RestHandler } from "msw";

import { SliceMachineManager } from "../managers/SliceMachineManager";
import { getSliceMachineManagerProcedures } from "../managers/createSliceMachineManagerMiddleware";

export type CreateSliceMachineManagerMSWHandlerArgs = {
	sliceMachineManager: SliceMachineManager;
	url: string;
};

export const createSliceMachineManagerMSWHandler = (
	args: CreateSliceMachineManagerMSWHandlerArgs,
): RestHandler<MockedRequest<DefaultBodyType>> => {
	return rest.post(args.url, async (req, res, ctx) => {
		const rpcResponse = await handleRPCRequest({
			body: await req.arrayBuffer(),
			procedures: getSliceMachineManagerProcedures({
				sliceMachineManager: args.sliceMachineManager,
			}),
		});

		return res(
			ctx.body(rpcResponse.body),
			ctx.set(rpcResponse.headers),
			ctx.status(rpcResponse.statusCode || 200),
		);
	});
};

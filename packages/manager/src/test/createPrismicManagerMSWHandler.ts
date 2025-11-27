import { handleRPCRequest } from "r19";
import { rest, DefaultBodyType, MockedRequest, RestHandler } from "msw";

import { PrismicManager } from "../managers/PrismicManager";
import { getPrismicManagerProcedures } from "../managers/createPrismicManagerMiddleware";

export type CreatePrismicManagerMSWHandlerArgs = {
	prismicManager: PrismicManager;
	url: string;
};

export const createPrismicManagerMSWHandler = (
	args: CreatePrismicManagerMSWHandlerArgs,
): RestHandler<MockedRequest<DefaultBodyType>> => {
	return rest.post(args.url, async (req, res, ctx) => {
		const rpcResponse = await handleRPCRequest({
			body: await req.arrayBuffer(),
			procedures: getPrismicManagerProcedures({
				prismicManager: args.prismicManager,
			}),
		});

		return res(
			ctx.body(rpcResponse.body),
			ctx.set(rpcResponse.headers),
			ctx.status(rpcResponse.statusCode || 200),
		);
	});
};

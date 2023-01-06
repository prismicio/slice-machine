import { handleRPCRequest } from "r19";
import { rest, DefaultBodyType, MockedRequest, RestHandler } from "msw";
import { Readable } from "node:stream";

import { SliceMachineManager } from "../managers/SliceMachineManager";
import { getSliceMachineManagerProcedures } from "../managers/createSliceMachineManagerMiddleware";

const streamToString = async (stream: Readable) => {
	const chunks: Buffer[] = [];

	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks).toString("utf-8");
};

export type CreateSliceMachineManagerMSWHandlerArgs = {
	sliceMachineManager: SliceMachineManager;
	url: string;
};

export const createSliceMachineManagerMSWHandler = (
	args: CreateSliceMachineManagerMSWHandlerArgs,
): RestHandler<MockedRequest<DefaultBodyType>> => {
	return rest.post(args.url, async (req, res, ctx) => {
		const rpcResponse = await handleRPCRequest({
			body: await req.text(),
			contentTypeHeader: req.headers.get("Content-Type"),
			procedures: getSliceMachineManagerProcedures({
				sliceMachineManager: args.sliceMachineManager,
			}),
		});

		return res(
			ctx.body(await streamToString(rpcResponse.stream)),
			ctx.set(rpcResponse.headers),
			ctx.status(rpcResponse.statusCode || 200),
		);
	});
};

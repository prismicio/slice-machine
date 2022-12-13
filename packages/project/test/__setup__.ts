// import { afterEach, beforeEach } from "vitest";
//
// import { createRPCServer, RPCServer } from "../src";
//
// import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
// import { createTestAdapter } from "./__testutils__/createTestAdapter";
//
// declare module "vitest" {
// 	export interface TestContext {
// 		server: RPCServer;
// 		serverPort: number;
// 	}
// }
//
// beforeEach(async (ctx) => {
// 	const adapter = createTestAdapter();
// 	const project = createSliceMachineProject(adapter);
//
// 	ctx.server = createRPCServer({ project });
//
// 	const { port } = await ctx.server.open();
//
// 	ctx.serverPort = port;
// });
//
// afterEach((ctx) => {
// 	ctx.server.close();
// });

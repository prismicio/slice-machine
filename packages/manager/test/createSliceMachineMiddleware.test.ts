import { it } from "vitest";
// import { expect, it, vi } from "vitest";
// import express from "express";
// import { Server } from "node:http";
// import { AddressInfo } from "node:net";
// import fetch from "node-fetch";
//
// import { createTestPlugin } from "./__testutils__/createTestPlugin";
// import { createTestProject } from "./__testutils__/createTestProject";
//
// import {
// 	createSliceMachineManager,
// 	createSliceMachineManagerMiddleware,
// } from "../src";
// import { createSliceMachineManagerClient } from "../src/client";

it.todo("creates an RPC middleware for a given manager", async () => {
	// const adapter = createTestPlugin();
	// const cwd = await createTestProject({ adapter });
	// const manager = createSliceMachineManager({
	// 	nativePlugins: { [adapter.meta.name]: adapter },
	// 	cwd,
	// });
	//
	// const middleware = createSliceMachineManagerMiddleware({
	// 	sliceMachineManager: manager,
	// });
	//
	// const app = express();
	// app.use("/manager", middleware);
	//
	// let server: Server | undefined;
	// try {
	// 	server = app.listen();
	//
	// 	const address = server.address() as AddressInfo;
	// 	const client = createSliceMachineManagerClient({
	// 		serverURL: `http://localhost:${address.port}/manager`,
	// 		fetch,
	// 	});
	//
	// 	const x = await client.project.getSliceMachineConfig();
	//
	// 	console.log(x);
	// } finally {
	// 	if (server) {
	// 		server.close();
	// 	}
	// }
});

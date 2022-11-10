import {
	PrismicUserProfile,
	SliceMachineManager,
	createSliceMachineManager,
	createSliceMachineManagerMiddleware,
} from "@slicemachine/core2";
import { createServer, Server } from "node:http";
import { createRequire } from "node:module";
import * as path from "node:path";
import { createApp, fromNodeMiddleware, toNodeListener } from "h3";
import serveStatic from "serve-static";

import { listen } from "./lib/listen";

const createSliceMachineServer = async (
	manager: SliceMachineManager
): Promise<Server> => {
	const projectRoot = await manager.getProjectRoot();
	const require = createRequire(path.join(projectRoot, "index.js"));
	const sliceMachineUIDir = require.resolve("slice-machine-ui/package.json");
	const sliceMachineOutDir = path.resolve(
		path.dirname(sliceMachineUIDir),
		"out"
	);

	const app = createApp();
	app.use(fromNodeMiddleware(serveStatic(sliceMachineOutDir)));
	app.use(
		"/_manager",
		fromNodeMiddleware(createSliceMachineManagerMiddleware({ manager }))
	);

	return createServer(toNodeListener(app));
};

const fetchProfile = async (
	manager: SliceMachineManager
): Promise<PrismicUserProfile | undefined> => {
	const isLoggedIn = await manager.checkIsLoggedIn();

	if (isLoggedIn) {
		return await manager.getProfile();
	}
};

const bootstrapPlugins = async (
	manager: SliceMachineManager
): Promise<void> => {
	await manager.initPlugins();

	// Validate Slice Machine config.
	await manager.loadSliceMachineConfig();

	// Validate Slice models.
	const allSlices = await manager.readAllSlices();
	if (allSlices.errors.length > 0) {
		// TODO: Provide better error message.
		throw new Error(allSlices.errors.join(", "));
	}

	// Validate Custom Type models.
	const allCustomTypes = await manager.readAllCustomTypes();
	if (allCustomTypes.errors.length > 0) {
		// TODO: Provide better error message.
		throw new Error(allCustomTypes.errors.join(", "));
	}
};

const run = async (): Promise<void> => {
	const manager = createSliceMachineManager();

	const [server, profile] = await Promise.all([
		createSliceMachineServer(manager),
		fetchProfile(manager),
		bootstrapPlugins(manager),
	]);

	const { address } = await listen(server, { port: 9999 });

	console.info("Slice Machine started");
	console.info(`Logged in as: ${profile?.email || "Not logged in"}`);
	console.info(`Running on: http://localhost:${address.port}`);
};

export default async function start(): Promise<void> {
	try {
		await run();
	} catch (error) {
		console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
		console.error("Full error: ", error);
	}
}

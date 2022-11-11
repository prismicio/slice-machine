import {
	PrismicUserProfile,
	SliceMachineManager,
	createSliceMachineManager,
	createSliceMachineManagerMiddleware,
} from "@slicemachine/core2";
import { createServer, Server } from "node:http";
import { createRequire } from "node:module";
import * as path from "node:path";
import {
	createApp,
	fromNodeMiddleware,
	toNodeListener,
	NodeListener,
	sendProxy,
	eventHandler,
	createRouter,
} from "h3";
import serveStatic from "serve-static";
import proxy from "express-http-proxy";

import { listen } from "./lib/listen";

const createSliceMachineServer = async (
	manager: SliceMachineManager
): Promise<Server> => {
	const app = createApp();

	app.use(
		"/_manager",
		fromNodeMiddleware(createSliceMachineManagerMiddleware({ manager }))
	);
	// TODO: Remove once tracking is implemented in `core2`
	app.use(
		"/api/s",
		eventHandler(() => {
			// noop

			return {};
		})
	);

	if (process.env.NODE_ENV === "development") {
		const router = createRouter();
		router.add(
			"/**",
			eventHandler((event) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const target = new URL(event.req.url!, "http://localhost:3000");

				return sendProxy(event, target.toString());
			})
		);
		app.use(router);
		//
		// app.use(
		// 	"/**",
		// 	eventHandler((event) => {
		// 		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// 		const target = new URL(event.req.url!, "http://localhost:3000");
		//
		// 		return sendProxy(event, target.toString());
		// 	})
		// );
		// app.use(fromNodeMiddleware(proxy("http://localhost:3000") as NodeListener));
	} else {
		const sliceMachineDir = await manager.locateSliceMachineDir();
		const sliceMachineOutDir = path.resolve(sliceMachineDir, "out");

		app.use(fromNodeMiddleware(serveStatic(sliceMachineOutDir)));
	}

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

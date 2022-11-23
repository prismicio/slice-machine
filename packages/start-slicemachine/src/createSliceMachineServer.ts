import {
	SliceMachineManager,
	createPrismicAuthManagerMiddleware,
	createSliceMachineManagerMiddleware,
} from "@slicemachine/core2";
import { createServer, Server } from "node:http";
import * as path from "node:path";
import {
	createApp,
	fromNodeMiddleware,
	toNodeListener,
	sendProxy,
	eventHandler,
	createRouter,
} from "h3";
import serveStatic from "serve-static";
import cors from "cors";

type CreateSliceMachineServerArgs = {
	sliceMachineManager: SliceMachineManager;
};

export const createSliceMachineServer = async (
	args: CreateSliceMachineServerArgs
): Promise<Server> => {
	const app = createApp();

	app.use(fromNodeMiddleware(cors()));

	app.use(
		"/_manager",
		fromNodeMiddleware(
			createSliceMachineManagerMiddleware({
				sliceMachineManager: args.sliceMachineManager,
			})
		)
	);

	app.use(
		"/api",
		fromNodeMiddleware(
			createPrismicAuthManagerMiddleware({
				prismicAuthManager: args.sliceMachineManager.getPrismicAuthManager(),
			})
		)
	);

	// TODO: Remove once tracking is implemented in `core2`
	app.use(
		"/api/s",
		eventHandler(() => {
			// noop

			return {};
		})
	);

	// TODO: Add auth middleware from `core2`

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
	} else {
		const sliceMachineDir =
			await args.sliceMachineManager.project.locateSliceMachineDir();
		const sliceMachineOutDir = path.resolve(sliceMachineDir, "out");

		app.use(fromNodeMiddleware(serveStatic(sliceMachineOutDir)));
	}

	return createServer(toNodeListener(app));
};

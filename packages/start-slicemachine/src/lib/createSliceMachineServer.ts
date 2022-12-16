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
import fetch from "node-fetch";

type CreateSliceMachineServerArgs = {
	sliceMachineManager: SliceMachineManager;
};

/**
 * Creates an HTTP server to handle the following:
 *
 * - Serve the Slice Machine app.
 * - Expose a given Slice Machine manager to non-Node.js environments, like the
 *   browser.
 *
 * The Slice Machine app is served from the project's Slice Machine module
 * installation.
 *
 * If `NODE_ENV` is `development`, the Slice Machine app is served via a proxy
 * to Next.js's development server. Slice Machine must be running on port 3000.
 *
 * @param args - Configuration for the server.
 *
 * @returns A standard `node:http` server.
 */
export const createSliceMachineServer = async (
	args: CreateSliceMachineServerArgs,
): Promise<Server> => {
	const app = createApp();

	app.use(fromNodeMiddleware(cors()));

	app.use(
		"/_manager",
		fromNodeMiddleware(
			createSliceMachineManagerMiddleware({
				sliceMachineManager: args.sliceMachineManager,
			}),
		),
	);

	app.use(
		"/api/auth",
		fromNodeMiddleware(
			createPrismicAuthManagerMiddleware({
				prismicAuthManager: args.sliceMachineManager.getPrismicAuthManager(),
			}),
		),
	);

	// TODO: Remove once tracking is implemented in `core2`
	app.use(
		"/api/s",
		eventHandler(() => {
			// noop

			return {};
		}),
	);

	if (process.env.NODE_ENV === "development") {
		const router = createRouter();
		router.add(
			"/**",
			eventHandler((event) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const target = new URL(event.req.url!, "http://localhost:3000");

				return sendProxy(event, target.toString(), {
					fetch: fetch as NonNullable<Parameters<typeof sendProxy>[2]>["fetch"],
				});
			}),
		);
		app.use(router);
	} else {
		const sliceMachineDir =
			await args.sliceMachineManager.project.locateSliceMachineUIDir();
		const sliceMachineOutDir = path.resolve(sliceMachineDir, "out");

		app.use(fromNodeMiddleware(serveStatic(sliceMachineOutDir)));
	}

	return createServer(toNodeListener(app));
};

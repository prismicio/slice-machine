import {
	createPrismicAuthManagerMiddleware,
	createSliceMachineManagerMiddleware,
	SliceMachineManager,
} from "@slicemachine/manager";
import * as path from "node:path";
import express, { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import serveStatic from "serve-static";
import cors from "cors";

type CreateSliceMachineExpressAppArgs = {
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
export const createSliceMachineExpressApp = async (
	args: CreateSliceMachineExpressAppArgs,
): Promise<Express> => {
	const app = express();

	app.use(cors());

	app.use(
		"/_manager",
		createSliceMachineManagerMiddleware({
			sliceMachineManager: args.sliceMachineManager,
		}),
	);

	app.use(
		"/api/auth",
		createPrismicAuthManagerMiddleware({
			prismicAuthManager: args.sliceMachineManager.getPrismicAuthManager(),
		}),
	);

	app.get("/app/s", (_req, res) => {
		// noop
		res.json({});
	});

	if (process.env.NODE_ENV === "development") {
		app.use(
			"/",
			createProxyMiddleware({
				target: "http://localhost:3000",
				changeOrigin: true,
				ws: true,
			}),
		);
	} else {
		const sliceMachineDir =
			await args.sliceMachineManager.project.locateSliceMachineUIDir();
		const sliceMachineOutDir = path.resolve(sliceMachineDir, "out");

		app.use(serveStatic(sliceMachineOutDir));

		app.get("/changelog", (_req, res) => {
			res.sendFile(path.join(sliceMachineOutDir, "changelog.html"));
		});

		app.get("/slices", (_req, res) => {
			res.sendFile(path.join(sliceMachineOutDir, "slices.html"));
		});

		app.get("/onboarding", (_req, res) => {
			res.sendFile(path.join(sliceMachineOutDir, "onboarding.html"));
		});

		app.get("/changes", (_req, res) => {
			res.sendFile(path.join(sliceMachineOutDir, "changes.html"));
		});

		app.get("/cts/:id", (_req, res) => {
			res.sendFile(path.join(sliceMachineOutDir, "cts/[ct].html"));
		});

		app.get("/:lib/:sliceID/:variation", (_req, res) => {
			res.sendFile(
				path.join(sliceMachineOutDir, "[lib]/[sliceName]/[variation].html"),
			);
		});

		app.get("/:lib/:sliceID/:variation/simulator", (_req, res) => {
			res.sendFile(
				path.join(
					sliceMachineOutDir,
					"[lib]/[sliceName]/[variation]/simulator.html",
				),
			);
		});

		app.get("/:lib/:sliceID/:variation/screenshot", (_req, res) => {
			res.sendFile(
				path.join(
					sliceMachineOutDir,
					"[lib]/[sliceName]/[variation]/screenshot.html",
				),
			);
		});
	}

	return app;
};

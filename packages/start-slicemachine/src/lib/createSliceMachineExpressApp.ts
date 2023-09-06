import * as path from "node:path";

import * as Sentry from "@sentry/node";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import serveStatic from "serve-static";
import cors from "cors";

import {
	SliceMachineManager,
	createPrismicAuthManagerMiddleware,
	createSliceMachineManagerMiddleware,
} from "@slicemachine/manager";

import * as sentryErrorHandlers from "./sentryErrorHandlers";
import { sentryFrontendTunnel } from "./sentryFrontendTunnel";
import { checkIsSentryEnabled } from "./checkIsSentryEnabled";

type CreateSliceMachineExpressAppArgs = {
	sliceMachineManager: SliceMachineManager;
};

/**
 * Creates an Express app to handle the following:
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
 * @returns A standard Express app.
 */
export const createSliceMachineExpressApp = async (
	args: CreateSliceMachineExpressAppArgs,
): Promise<Express> => {
	const isTelemetryEnabled =
		await args.sliceMachineManager.telemetry.checkIsTelemetryEnabled();

	const app = express();

	app.use(cors());

	app.use(
		"/_manager",
		createSliceMachineManagerMiddleware({
			sliceMachineManager: args.sliceMachineManager,
			onError: isTelemetryEnabled ? sentryErrorHandlers.rpc : undefined,
		}),
	);

	app.use(
		"/api/auth",
		createPrismicAuthManagerMiddleware({
			prismicAuthManager: args.sliceMachineManager.getPrismicAuthManager(),
			onLoginCallback: async () => {
				const profile = await args.sliceMachineManager.user.getProfile();
				await args.sliceMachineManager.telemetry.identify({
					userID: profile.shortId,
					intercomHash: profile.intercomHash,
				});
				if (checkIsSentryEnabled()) {
					Sentry.setUser({ id: profile.shortId });
				}

				try {
					await args.sliceMachineManager.screenshots.initS3ACL();
				} catch (error) {
					// noop - We'll try again before uploading a screenshot.
				}
			},
		}),
	);

	app.use("/api/t", bodyParser.text({ type: "*/*" }), sentryFrontendTunnel);

	if (import.meta.env.DEV) {
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

		app.get("/changes", (_req, res) => {
			res.sendFile(path.join(sliceMachineOutDir, "changes.html"));
		});

		app.get("/page-types/:id", (_req, res) => {
			res.sendFile(
				path.join(sliceMachineOutDir, "page-types/[pageTypeId].html"),
			);
		});

		app.get("/custom-types", (_req, res) => {
			res.sendFile(path.join(sliceMachineOutDir, "custom-types.html"));
		});

		app.get("/custom-types/:id", (_req, res) => {
			res.sendFile(
				path.join(sliceMachineOutDir, "custom-types/[customTypeId].html"),
			);
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

	if (isTelemetryEnabled) {
		app.use(sentryErrorHandlers.server);
	}

	return app;
};

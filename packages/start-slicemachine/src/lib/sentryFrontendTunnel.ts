// We tunnel the Sentry calls via the Express server to avoid ad blockers
// adapted from https://github.com/getsentry/examples/blob/0e2f17c5914f28ccae931e51801b7d9760d34cbe/tunneling/nextjs/pages/api/tunnel.js

import type { RequestHandler } from "express";
import * as Sentry from "@sentry/node";
import fetch from "node-fetch";

export const sentryFrontendTunnel: RequestHandler = async (req, res) => {
	try {
		const envelope = req.body;

		if (envelope) {
			const pieces = envelope.split("\n");
			const header = JSON.parse(pieces[0]);
			const { host, pathname } = new URL(header.dsn);
			const projectId =
				(pathname?.endsWith("/") ? pathname.slice(0, -1) : pathname) ?? "";
			const sentryUrl = `https://${host}/api/${projectId}/envelope/`;

			const response = await fetch(sentryUrl, {
				method: "POST",
				body: envelope,
			});

			if (!response.ok) {
				const errorMessage = await response.text();
				throw new Error(errorMessage);
			}
		}
	} catch (e) {
		Sentry.captureException(e);
	} finally {
		return res.status(202).send();
	}
};

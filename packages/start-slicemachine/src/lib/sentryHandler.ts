// We tunnel the Sentry calls via the express server to avoid add blockers
// adapted from https://github.com/getsentry/examples/blob/master/tunneling/nextjs/pages/api/tunnel.js

import * as url from "url";
import { H3Event, readRawBody } from "h3";
import fetch from "node-fetch";

async function handler(event: H3Event): Promise<Record<string, never>> {
	try {
		const envelope = await readRawBody(event);

		if (!envelope) {
			return {};
		}

		const pieces = envelope.split("\n");

		const header = JSON.parse(pieces[0]);

		const { host, path } = url.parse(header.dsn);

		const projectId = (path?.endsWith("/") ? path.slice(0, -1) : path) ?? "";

		const sentryUrl = `https://${host}/api/${projectId}/envelope/`;
		await fetch(sentryUrl, {
			method: "POST",
			body: envelope,
		});
	} catch (e) {
		// TODO add this back when we have the express
		//   captureException(e);
	} finally {
		return {};
	}
}

export default handler;

import {
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	NodeMiddleware,
	readBody,
} from "h3";

import { decode } from "@slicemachine/misc";

import { PrismicAuth } from "./PrismicAuth";
import { PrismicAuthRequest } from "./types";

export type CreatePrismicAuthMiddlewareArgs = {
	prismicAuth: PrismicAuth;
	onLoginCallback?: () => void;
};

export const createPrismicAuthMiddleware = (
	args: CreatePrismicAuthMiddlewareArgs,
): NodeMiddleware => {
	const router = createRouter();

	// Route called by the remote Prismic login page on successful login.
	router.post(
		"/",
		eventHandler(async (event) => {
			const body = await readBody(event);
			const { value, error } = decode(PrismicAuthRequest, body);

			if (error) {
				throw new Error(`Invalid auth payload: ${error.errors.join(", ")}`);
			}

			await args.prismicAuth.login({
				email: value.email,
				cookies: value.cookies,
			});

			if (args.onLoginCallback) {
				args.onLoginCallback();
			}

			return {};
		}),
	);

	return defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		return await router.handler(event);
	});
};

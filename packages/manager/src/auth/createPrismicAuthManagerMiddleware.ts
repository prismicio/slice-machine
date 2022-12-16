import * as t from "io-ts";
import {
	NodeMiddleware,
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	readBody,
} from "h3";

import { decode } from "../lib/decode";

import { PrismicAuthManager } from "./PrismicAuthManager";

const PrismicAuthRequest = t.type({
	email: t.string,
	cookies: t.array(t.string),
});
type PrismicAuthRequest = t.TypeOf<typeof PrismicAuthRequest>;

export type PrismicAuthCheckStatusResponse =
	| {
			status: "ok";
			shortId: string;
			intercomHash: string;
	  }
	| {
			status: "pending";
	  };

export type CreatePrismicAuthManagerMiddlewareArgs = {
	prismicAuthManager: PrismicAuthManager;
	onLoginCallback?: () => void;
};

export const createPrismicAuthManagerMiddleware = (
	args: CreatePrismicAuthManagerMiddlewareArgs,
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

			await args.prismicAuthManager.login({
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

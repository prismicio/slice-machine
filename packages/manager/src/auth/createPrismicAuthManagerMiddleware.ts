import * as t from "io-ts";
import {
	createEvent,
	createRouter,
	defineNodeMiddleware,
	eventHandler,
	NodeMiddleware,
	readBody,
} from "h3";

import { decode } from "../lib/decode";

import { PrismicAuthManager } from "./PrismicAuthManager";

const PrismicAuthResponse = t.type({
	email: t.string,
	cookies: t.array(t.string),
});
type PrismicAuthResponse = t.TypeOf<typeof PrismicAuthResponse>;

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
	onLoginCallback?: () => void | Promise<void>;
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
			const { value, error } = decode(PrismicAuthResponse, body);

			if (error) {
				throw new Error(`Invalid auth payload: ${error.errors.join(", ")}`);
			}

			await args.prismicAuthManager.login({
				email: value.email,
				cookies: value.cookies,
			});

			if (args.onLoginCallback) {
				await args.onLoginCallback();
			}

			return {};
		}),
	);

	return defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		await router.handler(event);

		res.end();
	});
};

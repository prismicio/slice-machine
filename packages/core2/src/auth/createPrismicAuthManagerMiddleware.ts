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
};

export const createPrismicAuthManagerMiddleware = (
	args: CreatePrismicAuthManagerMiddlewareArgs,
): NodeMiddleware => {
	const router = createRouter();

	// Route called by the remote Prismic login page on successful login.
	router.post(
		"/auth",
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

			return {};
		}),
	);

	// Route called by the remote Prismic login page at the start of the
	// authentication process.
	router.post(
		"/auth/start",
		eventHandler(async () => {
			await args.prismicAuthManager.logout();

			return {};
		}),
	);

	// Route called by the remote Prismic login page to verify local login status.
	router.post(
		"/auth/status",
		eventHandler(async (): Promise<PrismicAuthCheckStatusResponse> => {
			const isLoggedIn = await args.prismicAuthManager.checkIsLoggedIn();

			if (isLoggedIn) {
				const profile = await args.prismicAuthManager.getProfile();

				return {
					status: "ok",
					shortId: profile.shortId,
					intercomHash: profile.intercomHash,
				};
			} else {
				return {
					status: "pending",
				};
			}
		}),
	);

	return defineNodeMiddleware(async (req, res) => {
		const event = createEvent(req, res);

		return await router.handler(event);
	});
};

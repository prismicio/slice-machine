import * as t from "io-ts";

import { AUTH_COOKIE_KEY } from "./constants";

export const PrismicAuthState = t.intersection([
	t.type({
		base: t.string,
		cookies: t.intersection([
			t.partial({
				[AUTH_COOKIE_KEY]: t.string,
				SESSION: t.string,
			}),
			t.record(t.string, t.string),
		]),
	}),
	t.partial({
		shortId: t.string,
		intercomHash: t.string,
		oauthAccessToken: t.string,
		authUrl: t.string,
	}),
]);
export type PrismicAuthState = t.TypeOf<typeof PrismicAuthState>;

export const PrismicUserProfile = t.exact(
	t.type({
		userId: t.string,
		shortId: t.string,
		intercomHash: t.string,
		email: t.string,
		firstName: t.string,
		lastName: t.string,
	}),
);
export type PrismicUserProfile = t.TypeOf<typeof PrismicUserProfile>;

export const PrismicAuthRequest = t.type({
	email: t.string,
	cookies: t.array(t.string),
});
export type PrismicAuthRequest = t.TypeOf<typeof PrismicAuthRequest>;

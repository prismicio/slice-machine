import * as t from "io-ts";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import fetch from "node-fetch";
import cookie from "cookie";

import { decode } from "../lib/decode";
import { serializeCookies } from "../lib/serializeCookies";

import { APIEndpoints, SLICE_MACHINE_USER_AGENT } from "../constants";

const COOKIE_SEPARATOR = "; ";
const AUTH_COOKIE_KEY = "prismic-auth";
const SESSION_COOKIE_KEY = "SESSION";

const PERSISTED_AUTH_STATE_FILE_NAME = ".prismic";
const DEFAULT_PERSISTED_AUTH_STATE: PrismicAuthState = {
	base: "https://prismic.io",
	cookies: {},
};

const PrismicAuthState = t.intersection([
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
type PrismicAuthState = t.TypeOf<typeof PrismicAuthState>;

const PrismicUserProfile = t.exact(
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

type PrismicAuthManagerConstructorArgs = {
	scopedDirectory?: string;
};

type PrismicAuthManagerLoginArgs = {
	email: string;
	cookies: string[];
};

type GetProfileForAuthenticationTokenArgs = {
	authenticationToken: string;
};

const checkIsLoggedIn = (
	authState: PrismicAuthState,
): authState is PrismicAuthState & {
	cookies: Required<
		Pick<
			PrismicAuthState["cookies"],
			typeof AUTH_COOKIE_KEY | typeof SESSION_COOKIE_KEY
		>
	>;
} => {
	return Boolean(
		authState.cookies[AUTH_COOKIE_KEY] && authState.cookies[SESSION_COOKIE_KEY],
	);
};

const parseCookies = (cookies: string): Record<string, string> => {
	return cookie.parse(cookies, {
		// Don't escape any values.
		decode: (value) => value,
	});
};

export class PrismicAuthManager {
	// TODO: Automatically scope the manager to the current Slice Machine
	// project? If not, this internal state can be removed.
	scopedDirectory: string;

	constructor({
		scopedDirectory = os.homedir(),
	}: PrismicAuthManagerConstructorArgs = {}) {
		this.scopedDirectory = scopedDirectory;
	}

	// TODO: Method to refresh the current authentication token.

	// TODO: Make the `cookies` argument more explicit. What are these
	// mysterious cookies?
	// TODO: We should also handle fetching the Intercom hash and short ID
	// from the `/profile` endpoint and setting in the auth state.
	async login(args: PrismicAuthManagerLoginArgs): Promise<void> {
		const authState = await this._readPersistedAuthState();

		// Set the auth's URL base to the current base at runtime.
		authState.base = APIEndpoints.PrismicWroom;
		authState.cookies = {
			...authState.cookies,
			...parseCookies(args.cookies.join(COOKIE_SEPARATOR)),
		};

		if (checkIsLoggedIn(authState)) {
			const authenticationToken = authState.cookies[AUTH_COOKIE_KEY];
			const profile = await this.getProfileForAuthenticationToken({
				authenticationToken,
			});

			authState.shortId = profile.shortId;
			authState.intercomHash = profile.intercomHash;
		}

		await this._writePersistedAuthState(authState);
	}

	async logout(): Promise<void> {
		const authState = await this._readPersistedAuthState();

		// Remove all Prismic cookies associated with the currently
		// logged in user.
		authState.cookies = {};

		// TODO: Should shortID and intercomHash be cleared as well?

		await this._writePersistedAuthState(authState);
	}

	async getProfile(): Promise<PrismicUserProfile> {
		const authenticationToken = await this.getAuthenticationToken();

		return await this.getProfileForAuthenticationToken({ authenticationToken });
	}

	async getProfileForAuthenticationToken(
		args: GetProfileForAuthenticationTokenArgs,
	): Promise<PrismicUserProfile> {
		const url = new URL("/profile", APIEndpoints.PrismicUser);
		const res = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${args.authenticationToken}`,
				"User-Agent": SLICE_MACHINE_USER_AGENT,
			},
		});
		const json = await res.json();

		if (res.ok) {
			const { value: profile, error } = decode(PrismicUserProfile, json);

			if (error) {
				throw new Error(`Failed to decode profile: ${error.errors.join(", ")}`);
			}

			return profile;
		} else {
			// TODO: Provide a better error
			throw new Error(`Failed to get profile: ${JSON.stringify(json)}`);
		}
	}

	async getAuthenticationCookies(): Promise<
		PrismicAuthState["cookies"] &
			Required<
				Pick<
					PrismicAuthState["cookies"],
					typeof AUTH_COOKIE_KEY | typeof SESSION_COOKIE_KEY
				>
			>
	> {
		const authState = await this._readPersistedAuthState();

		if (!checkIsLoggedIn(authState)) {
			throw new Error("Not logged in.");
		}

		return authState.cookies;
	}

	async getAuthenticationToken(): Promise<string> {
		const authState = await this._readPersistedAuthState();

		// TODO: Maybe we want to dedupe logic with `getAuthenticationCookies`
		if (!checkIsLoggedIn(authState)) {
			throw new Error("Not logged in.");
		}

		return authState.cookies[AUTH_COOKIE_KEY];
	}

	// TODO: This function should check if the token has not expired, not
	// only if it exists. This may be done by accessing the profile
	// endpoint and checking the status code, but the endpoint is slow.
	// Is there a faster endpoint? Maybe the token refresh endpoint?
	async checkIsLoggedIn(): Promise<boolean> {
		const authState = await this._readPersistedAuthState();

		return checkIsLoggedIn(authState);
	}

	private async _readPersistedAuthState(): Promise<PrismicAuthState> {
		const authStateFilePath = this._getPersistedAuthStateFilePath();

		let authStateFileContents: string = JSON.stringify({});

		try {
			authStateFileContents = await fs.readFile(authStateFilePath, "utf8");
		} catch {
			// Write a default persisted state if it doesn't already exist.

			const defaultStateFileContents = {
				...DEFAULT_PERSISTED_AUTH_STATE,
				cookies: serializeCookies(DEFAULT_PERSISTED_AUTH_STATE.cookies),
			};
			authStateFileContents = JSON.stringify(
				defaultStateFileContents,
				null,
				"\t",
			);

			await fs.writeFile(authStateFilePath, authStateFileContents);
		}

		const rawAuthState = JSON.parse(authStateFileContents);

		// Decode cookies into a record for convenience.
		if ("cookies" in rawAuthState) {
			// TODO: Something about the return value doesn't seem
			// right. Properties like `Path` and `SameSite` are
			// returned as top-level properties.
			rawAuthState.cookies = parseCookies(rawAuthState.cookies);
		}

		const { value: authState, error } = decode(PrismicAuthState, rawAuthState);

		if (error) {
			throw new Error(
				`Failed to parse Prismic authentication state: ${error.errors.join(
					", ",
				)}`,
			);
		}

		return authState;
	}

	private async _writePersistedAuthState(
		authState: PrismicAuthState,
	): Promise<void> {
		const authStateFilePath = this._getPersistedAuthStateFilePath();

		const preparedAuthState = {
			...authState,
			cookies: serializeCookies(authState.cookies),
		};

		try {
			await fs.writeFile(
				authStateFilePath,
				JSON.stringify(preparedAuthState, null, 2),
			);
		} catch (error) {
			throw new Error(
				`Failed to write Prismic authentication state to the file system.`,
				{ cause: error },
			);
		}
	}

	private _getPersistedAuthStateFilePath(): string {
		return path.resolve(this.scopedDirectory, PERSISTED_AUTH_STATE_FILE_NAME);
	}
}

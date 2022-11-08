import * as t from "io-ts";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import fetch from "node-fetch";
import cookie from "cookie";

import {
	createPrismicAuthServer,
	PrismicAuthServer,
} from "./lib/createPrismicAuthServer";
import { decode } from "./lib/decode";
import { locateFileUpward } from "./lib/findFileUpward";
import { serializeCookies } from "./lib/serializeCookies";

import { APIEndpoints, SLICE_MACHINE_USER_AGENT } from "./constants";

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
type PrismicUserProfile = t.TypeOf<typeof PrismicUserProfile>;

type CreatePrismicAuthManager = ConstructorParameters<
	typeof PrismicAuthManager
>[0];

export const createPrismicAuthManager = (
	args: CreatePrismicAuthManager,
): PrismicAuthManager => {
	return new PrismicAuthManager(args);
};

type PrismicAuthManagerConstructorArgs = {
	scopedDirectory?: string;
	persistedAuthStateFileName?: string;
};

type PrismicAuthManagerLoginArgs = {
	email: string;
	cookies: string[];
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
	return (
		!authState.cookies[AUTH_COOKIE_KEY] ||
		!authState.cookies[SESSION_COOKIE_KEY]
	);
};

export class PrismicAuthManager {
	// TODO: Automatically scope the manager to the current Slice Machine
	// project? If not, this internal state can be removed.
	scopedDirectory: string;

	constructor({
		scopedDirectory = os.homedir(),
	}: PrismicAuthManagerConstructorArgs) {
		this.scopedDirectory = scopedDirectory;
	}

	async createPrismicAuthServer(): Promise<PrismicAuthServer> {
		return createPrismicAuthServer({ prismicAuthManager: this });
	}

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
			...cookie.parse(args.cookies.join(COOKIE_SEPARATOR)),
		};

		if (checkIsLoggedIn(authState)) {
			const authenticationToken = authState.cookies[AUTH_COOKIE_KEY];
			const profile = await this.getProfile(authenticationToken);

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

	async checkIsLoggedIn(): Promise<boolean> {
		const authState = await this._readPersistedAuthState();

		return checkIsLoggedIn(authState);
	}

	/**
	 * @param authenticationToken - An optional authentication token used to fetch
	 *   a specific user profile. If no authentication token is provided, the
	 *   persisted auth state's token will be used.
	 */
	async getProfile(authenticationToken?: string): Promise<PrismicUserProfile> {
		if (!authenticationToken) {
			const authState = await this._readPersistedAuthState();

			if (!checkIsLoggedIn(authState)) {
				throw new Error("Not logged in.");
			}

			authenticationToken = authState.cookies[AUTH_COOKIE_KEY];
		}

		const url = new URL("/profile", APIEndpoints.PrismicUser);
		const res = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${authenticationToken}`,
				"User-Agent": SLICE_MACHINE_USER_AGENT,
			},
		});
		const json = await res.json();

		const { value: profile, errors } = decode(PrismicUserProfile, json);

		if (errors) {
			throw new Error(`Failed to decode profile: ${errors.join(", ")}`);
		}

		return profile;
	}

	private async _readPersistedAuthState(): Promise<PrismicAuthState> {
		const authStateFilePath = await this._getPersistedAuthStateFilePath();

		let authStateFileContents: string = JSON.stringify({});

		try {
			authStateFileContents = await fs.readFile(authStateFilePath, "utf8");
		} catch {
			// Write a default persisted state if it doesn't already exist.

			authStateFileContents = JSON.stringify(
				DEFAULT_PERSISTED_AUTH_STATE,
				null,
				"\t",
			);

			await fs.writeFile(authStateFilePath, authStateFileContents);
		}

		const rawAuthState = JSON.parse(authStateFileContents);

		// Decode cookies into a record for convenience.
		if ("cookies" in rawAuthState) {
			rawAuthState.cookies = cookie.parse(rawAuthState.cookies);
		}

		const { value: authState, errors } = decode(PrismicAuthState, rawAuthState);

		if (errors) {
			throw new Error(
				`Failed to parse Prismic authentication state: ${errors.join(", ")}`,
			);
		}

		return authState;
	}

	private async _writePersistedAuthState(
		authState: PrismicAuthState,
	): Promise<void> {
		const authStateFilePath = await this._getPersistedAuthStateFilePath();

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

	private async _getPersistedAuthStateFilePath(): Promise<string> {
		return await locateFileUpward(PERSISTED_AUTH_STATE_FILE_NAME, {
			startDir: this.scopedDirectory,
		});
	}
}

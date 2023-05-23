import * as t from "io-ts";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import * as http from "node:http";

import * as h3 from "h3";
import fetch from "../lib/fetch";
import cookie from "cookie";
import cors from "cors";
import getPort from "get-port";

import { decode } from "../lib/decode";
import { serializeCookies } from "../lib/serializeCookies";

import { API_ENDPOINTS } from "../constants/API_ENDPOINTS";
import { SLICE_MACHINE_USER_AGENT } from "../constants/SLICE_MACHINE_USER_AGENT";
import { createPrismicAuthManagerMiddleware } from "./createPrismicAuthManagerMiddleware";
import {
	InternalError,
	UnauthenticatedError,
	UnexpectedDataError,
} from "../errors";

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
export type PrismicAuthState = t.TypeOf<typeof PrismicAuthState>;

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

type PrismicAuthManagerGetLoginSessionInfoReturnType = {
	port: number;
	url: string;
};

type PrismicAuthManagerNodeLoginSessionArgs = {
	port: number;
	onListenCallback?: () => void;
};

type GetProfileForAuthenticationTokenArgs = {
	authenticationToken: string;
};

const checkHasAuthenticationToken = (
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

	// TODO: Make the `cookies` argument more explicit. What are these
	// mysterious cookies?
	async login(args: PrismicAuthManagerLoginArgs): Promise<void> {
		const authState = await this._readPersistedAuthState();

		// Set the auth's URL base to the current base at runtime.
		authState.base = API_ENDPOINTS.PrismicWroom;
		authState.cookies = {
			...authState.cookies,
			...parseCookies(args.cookies.join(COOKIE_SEPARATOR)),
		};

		if (checkHasAuthenticationToken(authState)) {
			const authenticationToken = authState.cookies[AUTH_COOKIE_KEY];
			const profile = await this._getProfileForAuthenticationToken({
				authenticationToken,
			});

			authState.shortId = profile.shortId;
			authState.intercomHash = profile.intercomHash;
		}

		await this._writePersistedAuthState(authState);
	}

	async getLoginSessionInfo(): Promise<PrismicAuthManagerGetLoginSessionInfoReturnType> {
		// Pick a random port, with a preference for historic `5555`
		const port = await getPort({ port: 5555 });

		const url = new URL(
			`./dashboard/cli/login?source=slice-machine&port=${port}`,
			API_ENDPOINTS.PrismicWroom,
		).toString();

		return {
			port,
			url,
		};
	}

	async nodeLoginSession(
		args: PrismicAuthManagerNodeLoginSessionArgs,
	): Promise<void> {
		return new Promise<void>(async (resolve) => {
			// Timeout attempt after 3 minutes
			const timeout = setTimeout(() => {
				server.close();
				throw new Error(
					"Login timeout, server did not receive a response within a 3-minute delay",
				);
			}, 180_000);

			const app = h3.createApp();
			app.use(h3.fromNodeMiddleware(cors()));
			app.use(
				h3.fromNodeMiddleware(
					createPrismicAuthManagerMiddleware({
						prismicAuthManager: this,
						onLoginCallback() {
							// Cleanup process and resolve
							clearTimeout(timeout);
							server.close();
							resolve();
						},
					}),
				),
			);

			// Start server
			const server = http.createServer(h3.toNodeListener(app));
			await new Promise<void>((resolve) => {
				server.once("listening", () => {
					resolve();
				});
				server.listen(args.port);
			});

			if (args.onListenCallback) {
				args.onListenCallback();
			}
		});
	}

	async logout(): Promise<void> {
		const authState = await this._readPersistedAuthState();

		// Remove all Prismic cookies, short ID, and Intercom hash
		// associated with the currently logged in user.
		authState.cookies = {};
		authState.shortId = undefined;
		authState.intercomHash = undefined;

		await this._writePersistedAuthState(authState);
	}

	async checkIsLoggedIn(): Promise<boolean> {
		const authState = await this._readPersistedAuthState();

		if (checkHasAuthenticationToken(authState)) {
			const url = new URL("./validate", API_ENDPOINTS.PrismicAuthentication);
			url.searchParams.set("token", authState.cookies[AUTH_COOKIE_KEY]);

			let res;
			try {
				res = await fetch(url.toString(), {
					headers: {
						"User-Agent": SLICE_MACHINE_USER_AGENT,
					},
				});
			} catch (error) {
				// Noop, we return if `res` is not defined.
			}

			if (!res || !res.ok) {
				await this.logout();

				return false;
			}

			return true;
		} else {
			return false;
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
		const isLoggedIn = await this.checkIsLoggedIn();

		if (isLoggedIn) {
			const authState = await this._readPersistedAuthState();

			if (checkHasAuthenticationToken(authState)) {
				return authState.cookies;
			}
		}

		throw new Error("Not logged in.");
	}

	async getAuthenticationToken(): Promise<string> {
		const cookies = await this.getAuthenticationCookies();

		return cookies[AUTH_COOKIE_KEY];
	}

	async refreshAuthenticationToken(): Promise<void> {
		const authState = await this._readPersistedAuthState();

		if (checkHasAuthenticationToken(authState)) {
			const url = new URL(
				"./refreshtoken",
				API_ENDPOINTS.PrismicAuthentication,
			);
			url.searchParams.set("token", authState.cookies[AUTH_COOKIE_KEY]);

			const res = await fetch(url.toString(), {
				headers: {
					"User-Agent": SLICE_MACHINE_USER_AGENT,
				},
			});
			const text = await res.text();

			if (res.ok) {
				authState.cookies[AUTH_COOKIE_KEY] = text;

				await this._writePersistedAuthState(authState);
			} else {
				throw new InternalError("Failed to refresh authentication token.");
			}
		} else {
			throw new UnauthenticatedError();
		}
	}

	async getProfile(): Promise<PrismicUserProfile> {
		const authenticationToken = await this.getAuthenticationToken();

		return await this._getProfileForAuthenticationToken({
			authenticationToken,
		});
	}

	private async _getProfileForAuthenticationToken(
		args: GetProfileForAuthenticationTokenArgs,
	): Promise<PrismicUserProfile> {
		const url = new URL("./profile", API_ENDPOINTS.PrismicUser);
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
				throw new UnexpectedDataError(
					"Received invalid data from the Prismic user service.",
				);
			}

			return profile;
		} else {
			throw new InternalError(
				"Failed to retrieve profile from the Prismic user service.",
			);
		}
	}

	private async _readPersistedAuthState(): Promise<PrismicAuthState> {
		const authStateFilePath = this._getPersistedAuthStateFilePath();

		let authStateFileContents: string = JSON.stringify({});
		let rawAuthState: Record<string, unknown> = {};

		try {
			authStateFileContents = await fs.readFile(authStateFilePath, "utf8");
			rawAuthState = JSON.parse(authStateFileContents);
		} catch {
			// Write a default persisted state if it doesn't already exist.

			rawAuthState = {
				...DEFAULT_PERSISTED_AUTH_STATE,
				cookies: serializeCookies(DEFAULT_PERSISTED_AUTH_STATE.cookies),
			};
			authStateFileContents = JSON.stringify(rawAuthState, null, "\t");

			await fs.mkdir(path.dirname(authStateFilePath), { recursive: true });
			await fs.writeFile(authStateFilePath, authStateFileContents);
		}

		// Decode cookies into a record for convenience.
		if (typeof rawAuthState.cookies === "string") {
			rawAuthState.cookies = parseCookies(rawAuthState.cookies);
		}

		const { value: authState, error } = decode(PrismicAuthState, rawAuthState);

		if (error) {
			throw new UnexpectedDataError("Prismic authentication state is invalid.");
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
			throw new InternalError(
				"Failed to write Prismic authentication state to the file system.",
				{
					cause: error,
				},
			);
		}
	}

	private _getPersistedAuthStateFilePath(): string {
		return path.resolve(this.scopedDirectory, PERSISTED_AUTH_STATE_FILE_NAME);
	}
}

import * as t from "io-ts";
import { createServer, Server } from "node:http";
import { AddressInfo } from "node:net";
import { createApp, eventHandler, readBody, toNodeListener } from "h3";

import type { PrismicAuthManager } from "../createPrismicAuthManager";

import { decode } from "./decode";

const PrismicAuthRequest = t.type({
	email: t.string,
	cookies: t.array(t.string),
});
type PrismicAuthRequest = t.TypeOf<typeof PrismicAuthRequest>;

type CreatePrismicAuthServerArgs = ConstructorParameters<
	typeof PrismicAuthServer
>[0];

export const createPrismicAuthServer = (
	args: CreatePrismicAuthServerArgs,
): PrismicAuthServer => {
	return new PrismicAuthServer(args);
};

type PrismicAuthServerStartArgs = {
	port?: number;
};

type PrismicAuthCheckStatusResponse =
	| {
			status: "ok";
			shortId: string;
			intercomHash: string;
	  }
	| {
			status: "pending";
	  };

type RCPServerConstructorArgs = {
	prismicAuthManager: PrismicAuthManager;
};

export class PrismicAuthServer {
	private _prismicAuthManager: PrismicAuthManager;
	private _server: Server;

	constructor(args: RCPServerConstructorArgs) {
		this._prismicAuthManager = args.prismicAuthManager;
		this._server = this._createServer();
	}

	open({ port }: PrismicAuthServerStartArgs = {}): Promise<AddressInfo> {
		return new Promise((resolve) => {
			this._server.once("listening", () => {
				resolve(this._server.address() as AddressInfo);
			});

			this._server.listen({ port });
		});
	}

	close(): Promise<void> {
		return new Promise((resolve) => {
			this._server.once("close", resolve);

			this._server.close();
		});
	}

	private _createServer(): Server {
		const app = createApp();

		// Route called by the remote Prismic login page on successful login.
		app.use(
			"/auth",
			eventHandler(async (event) => {
				const body = readBody(event);
				const { value, error } = decode(PrismicAuthRequest, body);

				if (error) {
					throw new Error(`Invalid auth payload: ${error.errors.join(", ")}`);
				}

				await this._prismicAuthManager.login({
					email: value.email,
					cookies: value.cookies,
				});

				return {};
			}),
		);

		// Route called by the remote Prismic login page on entry.
		app.use("/auth/start", async () => {
			await this._prismicAuthManager.logout();

			return {};
		});

		// Route called by the remote Prismic login page to verify local login status.
		app.use(
			"/auth/status",
			eventHandler(async (): Promise<PrismicAuthCheckStatusResponse> => {
				const isLoggedIn = await this._prismicAuthManager.checkIsLoggedIn();

				if (isLoggedIn) {
					const profile = await this._prismicAuthManager.getProfile();

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

		return createServer(toNodeListener(app));
	}
}

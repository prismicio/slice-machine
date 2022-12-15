import * as t from "io-ts";
import fetch, { Response } from "node-fetch";

import { decode } from "../../lib/decode";
import { serializeCookies } from "../../lib/serializeCookies";

import { SLICE_MACHINE_USER_AGENT } from "../../constants/SLICE_MACHINE_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";

import { BaseManager } from "../BaseManager";

import {
	PrismicRepository,
	PrismicRepositoryRole,
	PrismicRepositoryUserAgent,
	PrismicRepositoryUserAgents,
} from "./types";

const DEFAULT_REPOSITORY_SETTINGS = {
	plan: "personal",
	isAnnual: "false",
	role: "developer",
};

type PrismicRepositoryManagerCheckExistsArgs = {
	domain: string;
};

type PrismicRepositoryManagerCreateArgs = {
	domain: string;
	framework: string; // TODO: Type(?)
};

type PrismicRepositoryManagerDeleteArgs = {
	domain: string;
	password: string;
};

type PrismicRepositoryManagerPushDocumentsArgs = {
	domain: string;
	signature: string;
	documents: Record<string, unknown>; // TODO: Type unknown if possible(?)
};

export class PrismicRepositoryManager extends BaseManager {
	// TODO: Add methods for repository-specific actions. E.g. creating a
	// new repository.

	async readAll(): Promise<PrismicRepository[]> {
		const url = new URL("/repositories", API_ENDPOINTS.PrismicUser);
		const res = await this._fetch({ url });
		const json = await res.json();

		if (res.ok) {
			const { value: repositories, error } = decode(
				t.array(PrismicRepository),
				json,
			);

			if (error) {
				throw new Error(
					`Failed to decode repositories: ${error.errors.join(", ")}`,
				);
			}

			return repositories;
		} else {
			throw new Error(`Failed to read repositories`, { cause: json });
		}
	}

	// Should this be in manager? It's one of the few sync method
	hasWriteAccess(repository: PrismicRepository): boolean {
		switch (repository.role) {
			case PrismicRepositoryRole.SuperUser:
			case PrismicRepositoryRole.Owner:
			case PrismicRepositoryRole.Administrator:
				return true;

			default:
				return false;
		}
	}

	async checkExists(
		args: PrismicRepositoryManagerCheckExistsArgs,
	): Promise<boolean> {
		const url = new URL(
			`/app/dashboard/repositories/${args.domain}/exists`,
			API_ENDPOINTS.PrismicWroom,
		);
		const res = await this._fetch({ url });
		const text = await res.text();

		if (res.ok) {
			return text === "false"; // Endpoint returns `false` when repository exists
		} else {
			throw new Error(
				`Failed to check repository existence for domain \`${args.domain}\``,
				{ cause: text },
			);
		}
	}

	async create(args: PrismicRepositoryManagerCreateArgs): Promise<void> {
		const url = new URL(
			"/authentication/newrepository?app=slicemachine",
			API_ENDPOINTS.PrismicWroom,
		);

		const body = {
			...DEFAULT_REPOSITORY_SETTINGS,
			domain: args.domain,
			framework: args.framework, // This property appears to be optional for the API
		};

		const res = await this._fetch({
			url,
			method: "POST",
			body,
			userAgent: PrismicRepositoryUserAgent.SliceMachine, // Custom User Agent is required
		});
		const text = await res.text();

		// Endpoint returns repository name on success, which must be more than 4 characters and less than 30
		// if (!res.ok) {
		if (!res.ok || text.length < 4 || text.length > 30) {
			throw new Error(`Failed to create repository \`${args.domain}\``, {
				cause: res,
			});
		}
	}

	async delete(args: PrismicRepositoryManagerDeleteArgs): Promise<void> {
		const cookies = await this.user.getAuthenticationCookies();

		const url = new URL(
			`/app/settings/delete?_=${cookies["X_XSRF"]}`, // TODO: Maybe we want to throw early if the token is no available, or get the token another way
			API_ENDPOINTS.PrismicWroom,
		);
		// Update hostname to include repository domain
		url.hostname = `${args.domain}.${url.hostname}`;

		const body = {
			confirm: args.domain,
			password: args.password,
		};

		const res = await this._fetch({
			url,
			method: "POST",
			body,
			userAgent: PrismicRepositoryUserAgent.LegacyZero, // Custom User Agent is required
		});

		if (!res.ok) {
			throw new Error(`Failed to delete repository \`${args.domain}\``, {
				cause: res,
			});
		}
	}

	async pushDocuments(
		args: PrismicRepositoryManagerPushDocumentsArgs,
	): Promise<void> {
		const url = new URL("/starter/documents", API_ENDPOINTS.PrismicWroom);
		// Update hostname to include repository domain
		url.hostname = `${args.domain}.${url.hostname}`;

		const body = {
			signature: args.signature,
			documents: JSON.stringify(args.documents),
		};

		const res = await this._fetch({
			url,
			method: "POST",
			body,
			userAgent: PrismicRepositoryUserAgent.LegacyZero, // Custom User Agent is required
		});

		if (!res.ok) {
			let reason: string | null = null;
			try {
				reason = await res.text();
			} catch {
				// Noop
			}

			// Ideally the API should throw a 409 or something like that...
			if (reason === "Repository should not contain documents") {
				throw new Error(
					`Failed to push documents to repository \`${args.domain}\`, repository is not empty`,
					{
						cause: res,
					},
				);
			}

			throw new Error(
				`Failed to push documents to repository \`${args.domain}\`, ${res.status} ${res.statusText}`,
				{
					cause: res,
				},
			);
		}
	}

	private async _fetch(args: {
		url: URL;
		method?: "GET" | "POST";
		body?: unknown;
		userAgent?: PrismicRepositoryUserAgents;
	}): Promise<Response> {
		const cookies = await this.user.getAuthenticationCookies();

		const extraHeaders: Record<string, string> = {};

		if (args.body) {
			extraHeaders["Content-Type"] = "application/json";
		}

		return fetch(args.url.toString(), {
			method: args.method,
			body: args.body ? JSON.stringify(args.body) : undefined,
			headers: {
				// Some endpoints rely on the authorization header...
				Authorization: `Bearer ${cookies["prismic-auth"]}`,
				Cookie: serializeCookies(cookies),
				"User-Agent": args.userAgent || SLICE_MACHINE_USER_AGENT,
				...extraHeaders,
			},
		});
	}
}

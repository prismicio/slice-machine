import * as t from "io-ts";
import fetch, { Response } from "node-fetch";

import { BaseManager } from "./_BaseManager";

import { APIEndpoints, SLICE_MACHINE_USER_AGENT } from "../constants";
import { serializeCookies } from "../lib/serializeCookies";
import { decode } from "../lib/decode";

const PrismicRepositoryRoles = {
	SuperUser: "SuperUser",
	Administrator: "Administrator",
	Owner: "Owner",
	Manager: "Manager",
	Publisher: "Publisher",
	Writer: "Writer",
	Readonly: "Readonly",
} as const;
type PrismicRepositoryRoles =
	typeof PrismicRepositoryRoles[keyof typeof PrismicRepositoryRoles];

const PrismicRepository = t.type({
	domain: t.string,
	name: t.string,
	role: t.union([
		t.keyof(PrismicRepositoryRoles),
		t.record(t.string, t.keyof(PrismicRepositoryRoles)),
	]),
});
type PrismicRepository = t.TypeOf<typeof PrismicRepository>;

type SliceMachineManagerExistsRepositoryArgs = {
	domain: string;
};

type SliceMachineManagerCreateRepositoryArgs = {
	domain: string;
	framework: string; // TODO: Type(?)
};

type SliceMachineManagerDeleteRepositoryArgs = {
	domain: string;
	password: string;
};

type SliceMachineManagerPushDocumentsArgs = {
	domain: string;
	signature: string;
	documents: Record<string, unknown>; // TODO: Type unknown if possible(?)
};

export class RepositoryManager extends BaseManager {
	// TODO: Add methods for repository-specific actions. E.g. creating a
	// new repository.

	async readAll(): Promise<PrismicRepository[]> {
		const url = new URL("/repositories", APIEndpoints.PrismicUser);
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

	async exists(
		args: SliceMachineManagerExistsRepositoryArgs,
	): Promise<boolean> {
		const url = new URL(
			`/app/dashboard/repositories/${args.domain}/exists`,
			APIEndpoints.PrismicWroom,
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

	async create(args: SliceMachineManagerCreateRepositoryArgs): Promise<void> {
		const url = new URL(
			"/authentication/newrepository?app=slicemachine",
			APIEndpoints.PrismicWroom,
		);

		const body = {
			domain: args.domain,
			framework: args.framework, // This property appears to be optional for the API
			// TODO: Maybe those date shouldn't be hardcoded
			plan: "personal", // Using any other value than "personal" requires payment
			isAnnual: "false", // This property appears to be optional for the API
			role: "developer", // This property appears to be optional for the API
		};

		const res = await this._fetch({
			url,
			method: "POST",
			body,
			userAgent: "prismic-cli/sm", // Custom User Agent is required
		});

		if (!res.ok) {
			throw new Error(`Failed to create repository \`${args.domain}\``, {
				cause: res,
			});
		}
	}

	async delete(args: SliceMachineManagerDeleteRepositoryArgs): Promise<void> {
		const cookies = await this.user.getAuthenticationCookies();

		const url = new URL(
			`/app/settings/delete?_=${cookies["X_XSRF"]}`, // TODO: Maybe we want to throw early if the token is no available, or get the token another way
			APIEndpoints.PrismicWroom,
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
			userAgent: "prismic-cli/0", // Custom User Agent is required
		});

		if (!res.ok) {
			throw new Error(`Failed to delete repository \`${args.domain}\``, {
				cause: res,
			});
		}
	}

	async pushDocuments(
		args: SliceMachineManagerPushDocumentsArgs,
	): Promise<void> {
		const url = new URL("/starter/documents", APIEndpoints.PrismicWroom);
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
			userAgent: "prismic-cli/0", // Custom User Agent is required
		});

		if (!res.ok) {
			throw new Error(
				`Failed to push documents to repository \`${args.domain}\``,
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
		userAgent?: string;
	}): Promise<Response> {
		const cookies = await this.user.getAuthenticationCookies();

		return fetch(args.url.toString(), {
			method: args.method,
			body: args.body ? JSON.stringify(args.body) : undefined,
			headers: {
				// Some endpoints rely on the authorization header...
				Authorization: `Bearer ${cookies["prismic-auth"]}`,
				// ... and some just parse cookies
				Cookie: serializeCookies(cookies),
				"User-Agent": args.userAgent || SLICE_MACHINE_USER_AGENT,
			},
		});
	}
}

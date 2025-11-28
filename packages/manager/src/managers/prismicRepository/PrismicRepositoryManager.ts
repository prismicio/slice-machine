import * as t from "io-ts";
import fetch, { Response } from "node-fetch";

import { decode } from "../../lib/decode";
import { PRISMIC_CLI_USER_AGENT } from "../../constants/PRISMIC_CLI_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { BaseManager } from "../BaseManager";
import { PrismicRepository, PrismicRepositoryRole } from "./types";

type PrismicRepositoryManagerCheckExistsArgs = {
	domain: string;
};

export class PrismicRepositoryManager extends BaseManager {
	async readAll(): Promise<PrismicRepository[]> {
		const url = new URL("./repositories", API_ENDPOINTS.PrismicLegacyUserApi);
		const res = await this._fetch({ url });

		if (res.ok) {
			const json = await res.json();
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
			const text = await res.text();
			throw new Error(`Failed to read repositories`, { cause: text });
		}
	}

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
			`./app/dashboard/repositories/${args.domain}/exists`,
			API_ENDPOINTS.PrismicWroom,
		);
		const res = await this._fetch({
			url,
			skipAuthentication: true,
		});

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

	private async _fetch(args: {
		url: URL;
		method?: "GET" | "POST" | "PATCH";
		body?: unknown;
		repository?: string;
		skipAuthentication?: boolean;
	}): Promise<Response> {
		let token;
		try {
			token = await this.user.getAuthenticationToken();
		} catch (e) {
			if (!args.skipAuthentication) {
				throw e;
			}
		}

		const extraHeaders: Record<string, string> = {};

		if (args.body) {
			extraHeaders["Content-Type"] = "application/json";
		}

		if (args.repository) {
			extraHeaders.repository = args.repository;
		}

		return await fetch(args.url.toString(), {
			method: args.method,
			body: args.body ? JSON.stringify(args.body) : undefined,
			headers: {
				...(token !== undefined
					? {
							Authorization: `Bearer ${token}`,
					  }
					: {}),
				"User-Agent": PRISMIC_CLI_USER_AGENT,
				...extraHeaders,
			},
		});
	}
}

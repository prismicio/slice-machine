import * as t from "io-ts";
import fetch, { Response } from "../../lib/fetch";
import { fold } from "fp-ts/Either";

import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decode } from "../../lib/decode";
import { serializeCookies } from "../../lib/serializeCookies";

import { PRISMIC_CLI_USER_AGENT } from "../../constants/PRISMIC_CLI_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";

import { UnauthenticatedError } from "../../errors";

import { BaseManager } from "../BaseManager";

import {
	AllChangeTypes,
	PushBody,
	ChangeTypes,
	ClientError,
	PushChangesLimit,
	PushChangesLimitType,
	PrismicRepository,
	PrismicRepositoryRole,
	PushChangesRawLimit,
	TransactionalMergeArgs,
	TransactionalMergeReturnType,
} from "./types";

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

	async pushChanges(
		args: TransactionalMergeArgs,
	): Promise<TransactionalMergeReturnType> {
		assertPluginsInitialized(this.pluginSystemRunner);

		if (!(await this.user.checkIsLoggedIn())) {
			throw new UnauthenticatedError();
		}

		try {
			const allChanges: AllChangeTypes[] = await Promise.all(
				args.changes.map(async (change) => {
					if (change.type === "Slice") {
						switch (change.status) {
							case "NEW": {
								const { model } = await this.slices.readSlice({
									libraryID: change.libraryID,
									sliceID: change.id,
								});

								if (!model) {
									throw Error(`Could not find model ${change.id}`);
								}

								return {
									id: change.id,
									payload: model,
									type: ChangeTypes.SLICE_INSERT,
								};
							}
							case "MODIFIED": {
								const { model } = await this.slices.readSlice({
									libraryID: change.libraryID,
									sliceID: change.id,
								});

								if (!model) {
									throw Error(`Could not find model ${change.id}`);
								}

								return {
									id: change.id,
									payload: model,
									type: ChangeTypes.SLICE_UPDATE,
								};
							}
							case "DELETED":
								return {
									id: change.id,
									payload: { id: change.id },
									type: ChangeTypes.SLICE_DELETE,
								};
						}
					} else {
						switch (change.status) {
							case "NEW": {
								const { model } = await this.customTypes.readCustomType({
									id: change.id,
								});
								if (!model) {
									throw Error(`Could not find model ${change.id}`);
								}

								return {
									type: ChangeTypes.CUSTOM_TYPE_INSERT,
									id: change.id,
									payload: model,
								};
							}
							case "MODIFIED": {
								const { model } = await this.customTypes.readCustomType({
									id: change.id,
								});
								if (!model) {
									throw Error(`Could not find model ${change.id}`);
								}

								return {
									type: ChangeTypes.CUSTOM_TYPE_UPDATE,
									id: change.id,
									payload: model,
								};
							}
							case "DELETED":
								return {
									id: change.id,
									payload: { id: change.id },
									type: ChangeTypes.CUSTOM_TYPE_DELETE,
								};
						}
					}
				}),
			);

			// Compute the POST body
			const requestBody: PushBody = {
				confirmDeleteDocuments: args.confirmDeleteDocuments,
				changes: allChanges,
			};

			const repositoryName = await this.project.getRepositoryName();

			const response = await this._fetch({
				url: new URL("./push", API_ENDPOINTS.PrismicLegacySliceMachineApi),
				method: "POST",
				body: requestBody,
				repository: repositoryName,
			});

			switch (response.status) {
				case 202:
					return this._decodeLimitOrThrow(
						await response.json(),
						response.status,
						PushChangesLimitType.SOFT,
					);
				case 204:
					return null;
				case 401:
					throw new UnauthenticatedError();
				case 403:
					return this._decodeLimitOrThrow(
						await response.json(),
						response.status,
						PushChangesLimitType.HARD,
					);
				case 400:
					const text = await response.text();
					throw new Error(text);
				default:
					throw new Error(`Unexpected status code ${response.status}`, {
						cause: await response.text(),
					});
			}
		} catch (err) {
			console.error("An error happened while pushing your changes");
			console.error(err);

			throw err;
		}
	}

	private _decodeLimitOrThrow(
		potentialLimit: unknown,
		statusCode: number,
		limitType: PushChangesLimitType,
	): PushChangesLimit | null {
		return fold<t.Errors, PushChangesRawLimit, PushChangesLimit | null>(
			() => {
				const error: ClientError = {
					status: statusCode,
					message: `Unable to parse raw limit from ${JSON.stringify(
						potentialLimit,
					)}`,
				};
				throw error;
			},
			(rawLimit: PushChangesRawLimit) => {
				const limit = { ...rawLimit, type: limitType };

				return limit;
			},
		)(PushChangesRawLimit.decode(potentialLimit));
	}

	private async _fetch(args: {
		url: URL;
		method?: "GET" | "POST" | "PATCH";
		body?: unknown;
		repository?: string;
		skipAuthentication?: boolean;
	}): Promise<Response> {
		let cookies;
		try {
			cookies = await this.user.getAuthenticationCookies();
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
				// Some endpoints rely on the authorization header...

				...(cookies !== undefined
					? {
							Authorization: `Bearer ${cookies["prismic-auth"]}`,
							Cookie: serializeCookies(cookies),
					  }
					: {}),
				"User-Agent": PRISMIC_CLI_USER_AGENT,
				...extraHeaders,
			},
		});
	}
}

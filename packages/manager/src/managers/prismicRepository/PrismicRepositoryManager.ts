import * as t from "io-ts";
import { z } from "zod";
import fetch, { Response } from "../../lib/fetch";
import { fold } from "fp-ts/Either";

import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decode } from "../../lib/decode";
import { serializeCookies } from "../../lib/serializeCookies";

import { SLICE_MACHINE_USER_AGENT } from "../../constants/SLICE_MACHINE_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { REPOSITORY_NAME_VALIDATION } from "../../constants/REPOSITORY_NAME_VALIDATION";

import {
	UnauthenticatedError,
	UnauthorizedError,
	UnexpectedDataError,
} from "../../errors";

import { BaseManager } from "../BaseManager";

import {
	AllChangeTypes,
	BulkBody,
	ChangeTypes,
	ClientError,
	PushChangesLimit,
	PushChangesLimitType,
	PrismicRepository,
	PrismicRepositoryRole,
	PrismicRepositoryUserAgent,
	PrismicRepositoryUserAgents,
	PushChangesRawLimit,
	TransactionalMergeArgs,
	TransactionalMergeReturnType,
	FrameworkWroomTelemetryID,
	StarterId,
	Environment,
	OnboardingState,
} from "./types";
import { sortEnvironments } from "./sortEnvironments";

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
	framework: FrameworkWroomTelemetryID;
	starterId?: StarterId;
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

type PrismicRepositoryManagerFetchEnvironmentsArgs = {
	/**
	 * If set to `true`, all environments are returned regardless of the user's
	 * permission level.
	 *
	 * If set to `false`, only environments the user can access are returned.
	 *
	 * @defaultValue `false`
	 */
	includeAll?: boolean;
};

type PrismicRepositoryManagerFetchEnvironmentsReturnType = {
	environments?: Environment[];
};

export class PrismicRepositoryManager extends BaseManager {
	// TODO: Add methods for repository-specific actions. E.g. creating a
	// new repository.

	async readAll(): Promise<PrismicRepository[]> {
		const url = new URL("./repositories", API_ENDPOINTS.PrismicUser);
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

	// Should this be in manager? It's one of the few sync method
	//
	// Reply from Angelo 2022-12-22: I think it should be in manager
	// because we shouldn't be exporting root-level utilities from this
	// package. If we want to make it more inline with the other methods,
	// we could simplify the API by changing its signature to the
	// following:
	//
	// ```ts
	// (repositoryName: string) => Promise<boolean>
	// ```
	//
	// This method would:
	//
	// 1. Fetch the list of repositories for the user using `readAll()`.
	//    The list would be cached.
	// 2. Determine if the user has write access to the given repository.
	//
	// This version has the following benefits:
	//
	// - Does not expect the consumer to supply a repository object; it
	//   only requires a repository name, which could be sourced from
	//   anything (incl. the project's `slicemachine.config.json`).
	//
	// - Similarly, it does not expect the consumer to call `readAll()`
	//   before calling this method.
	//
	// - Works for repositories that the user does not have access to. For
	//   example, I could use it to check if I have access to "qwerty",
	//   even if I am not added as a user. The purpose of the method is
	//   still valid: do I have write access to a given repository?
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

	async create(args: PrismicRepositoryManagerCreateArgs): Promise<void> {
		const url = new URL(
			"./authentication/newrepository?app=slicemachine",
			API_ENDPOINTS.PrismicWroom,
		);

		const body = {
			...DEFAULT_REPOSITORY_SETTINGS,
			domain: args.domain,
			// These properties are optional in the API but needed for tracking
			framework: args.framework,
			starterId: args.starterId,
		};

		const res = await this._fetch({
			url,
			method: "POST",
			body,
			userAgent: PrismicRepositoryUserAgent.SliceMachine, // Custom User Agent is required
		});
		const text = await res.text();

		// Endpoint returns repository name on success, that should be within the validation range
		// Even when there is an error, we get a 200 success and so we have to check the name thanks to that
		if (
			!res.ok ||
			text.length < REPOSITORY_NAME_VALIDATION.Min ||
			text.length > REPOSITORY_NAME_VALIDATION.Max
		) {
			throw new Error(`Failed to create repository \`${args.domain}\``, {
				cause: text,
			});
		}
	}

	// TODO: Delete this endpoint? It doesn't seem to be used (I might be wrong). - Angelo
	async delete(args: PrismicRepositoryManagerDeleteArgs): Promise<void> {
		const cookies = await this.user.getAuthenticationCookies();

		const url = new URL(
			`./app/settings/delete?_=${cookies["X_XSRF"]}`, // TODO: Maybe we want to throw early if the token is no available, or get the token another way
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
		const url = new URL("./starter/documents", API_ENDPOINTS.PrismicWroom);
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
						cause: reason,
					},
				);
			}

			throw new Error(
				`Failed to push documents to repository \`${args.domain}\`, ${res.status} ${res.statusText}`,
				{
					cause: reason,
				},
			);
		}
	}

	async pushChanges(
		args: TransactionalMergeArgs,
	): Promise<TransactionalMergeReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		if (!(await this.user.checkIsLoggedIn())) {
			throw new UnauthenticatedError();
		}

		try {
			// Update the AWS ACL before uploading screenshots as it might have expired
			await this.screenshots.initS3ACL();

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

								const modelWithScreenshots =
									await this.slices.updateSliceModelScreenshotsInPlace({
										libraryID: change.libraryID,
										model,
									});

								return {
									id: change.id,
									payload: modelWithScreenshots,
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

								const modelWithScreenshots =
									await this.slices.updateSliceModelScreenshotsInPlace({
										libraryID: change.libraryID,
										model,
									});

								return {
									id: change.id,
									payload: modelWithScreenshots,
									type: ChangeTypes.SLICE_UPDATE,
								};
							}
							case "DELETED":
								await this.screenshots.deleteScreenshotFolder({
									sliceID: change.id,
								});

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
			const requestBody: BulkBody = {
				confirmDeleteDocuments: args.confirmDeleteDocuments,
				changes: allChanges,
			};

			const repositoryName = await this.project.getResolvedRepositoryName();

			// TODO: move to customtypes client
			const response = await this._fetch({
				url: new URL("./bulk", API_ENDPOINTS.PrismicModels),
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

	async fetchEnvironments(
		args?: PrismicRepositoryManagerFetchEnvironmentsArgs,
	): Promise<PrismicRepositoryManagerFetchEnvironmentsReturnType> {
		const repositoryName = await this.project.getRepositoryName();

		const url = new URL(`./environments`, API_ENDPOINTS.SliceMachineV1);
		url.searchParams.set("repository", repositoryName);

		const res = await this._fetch({ url });

		if (res.ok) {
			const json = await res.json();

			const { value, error } = decode(
				t.union([
					t.type({
						results: t.array(Environment),
					}),
					t.type({
						error: t.literal("invalid_token"),
					}),
				]),
				json,
			);

			if (error) {
				throw new UnexpectedDataError(
					`Failed to decode environments: ${error.errors.join(", ")}`,
				);
			}

			if ("results" in value) {
				let environments = value.results;

				if (!args?.includeAll) {
					const profile = await this.user.getProfile();

					environments = environments.filter((environment) =>
						environment.users.some((user) => user.id === profile.shortId),
					);
				}

				return { environments: sortEnvironments(environments) };
			}
		}

		switch (res.status) {
			case 400:
			case 401:
				throw new UnauthenticatedError();
			case 403:
				throw new UnauthorizedError();
			default:
				throw new Error("Failed to fetch environments.");
		}
	}

	async fetchOnboarding(): Promise<OnboardingState> {
		const repositoryName = await this.project.getRepositoryName();

		const url = new URL("/onboarding", API_ENDPOINTS.RepositoryService);
		url.searchParams.set("repository", repositoryName);
		const res = await this._fetch({ url });

		if (res.ok) {
			const json = await res.json();
			const { value, error } = decode(OnboardingState, json);

			if (error) {
				throw new UnexpectedDataError(
					`Failed to decode onboarding: ${error.errors.join(", ")}`,
				);
			}
			if (value) {
				return value;
			}
		}

		switch (res.status) {
			case 400:
			case 401:
				throw new UnauthenticatedError();
			case 403:
				throw new UnauthorizedError();
			default:
				throw new Error("Failed to fetch onboarding.");
		}
	}

	async toggleOnboardingStep(
		stepId: string,
	): Promise<{ completedSteps: string[] }> {
		const repositoryName = await this.project.getRepositoryName();

		const url = new URL(
			`/onboarding/${stepId}/toggle`,
			API_ENDPOINTS.RepositoryService,
		);
		url.searchParams.set("repository", repositoryName);
		const res = await this._fetch({ url, method: "PATCH" });

		if (res.ok) {
			const json = await res.json();
			const { value, error } = decode(
				z.object({ completedSteps: z.array(z.string()) }),
				json,
			);

			if (error) {
				throw new UnexpectedDataError(
					`Failed to decode onboarding step toggle: ${error.errors.join(", ")}`,
				);
			}

			if (value) {
				return value;
			}
		}

		switch (res.status) {
			case 400:
			case 401:
				throw new UnauthenticatedError();
			case 403:
				throw new UnauthorizedError();
			default:
				throw new Error("Failed to toggle onboarding step.");
		}
	}

	async completeOnboardingStep(
		...stepIds: string[]
	): Promise<{ completedSteps: string[] }> {
		const repositoryName = await this.project.getRepositoryName();

		const currentState = await this.fetchOnboarding();
		const incompleteSteps = stepIds.filter(
			(stepId) => !currentState.completedSteps.includes(stepId),
		);

		if (incompleteSteps.length > 0) {
			// TODO: Refactor when the API accepts multiple steps (DT-2389)
			for await (const stepId of incompleteSteps) {
				const url = new URL(
					`/onboarding/${stepId}/toggle`,
					API_ENDPOINTS.RepositoryService,
				);
				url.searchParams.set("repository", repositoryName);
				const res = await this._fetch({ url, method: "PATCH" });

				if (res.ok) {
					const json = await res.json();
					const { value, error } = decode(
						z.object({ completedSteps: z.array(z.string()) }),
						json,
					);

					if (error) {
						throw new UnexpectedDataError(
							`Failed to decode onboarding step complete response: ${error.errors.join(
								", ",
							)}`,
						);
					}

					if (value) {
						currentState.completedSteps = value.completedSteps;
						continue;
					}
				}

				switch (res.status) {
					case 400:
					case 401:
						throw new UnauthenticatedError();
					case 403:
						throw new UnauthorizedError();
					default:
						throw new Error("Failed to complete onboarding step.");
				}
			}
		}

		return { completedSteps: currentState.completedSteps };
	}

	async toggleOnboarding(): Promise<{ isDismissed: boolean }> {
		const repositoryName = await this.project.getRepositoryName();

		const url = new URL("/onboarding/toggle", API_ENDPOINTS.RepositoryService);
		url.searchParams.set("repository", repositoryName);
		const res = await this._fetch({ url, method: "PATCH" });

		if (res.ok) {
			const json = await res.json();
			const { value, error } = decode(
				z.object({ isDismissed: z.boolean() }),
				json,
			);

			if (error) {
				throw new UnexpectedDataError(
					`Failed to decode onboarding toggle: ${error.errors.join(", ")}`,
				);
			}

			if (value) {
				return value;
			}
		}

		switch (res.status) {
			case 400:
			case 401:
				throw new UnauthenticatedError();
			case 403:
				throw new UnauthorizedError();
			default:
				throw new Error("Failed to toggle onboarding guide.");
		}
	}

	async setDefaultMasterLocale(): Promise<void> {
		const repositoryName = await this.project.getRepositoryName();

		const url = new URL("repository/locales", API_ENDPOINTS.LocaleService);
		url.searchParams.set("repository", repositoryName);

		const res = await this._fetch({
			url,
			method: "POST",
			body: {
				id: "en-us",
				isMaster: true,
			},
		});

		if (!res.ok) {
			switch (res.status) {
				case 400:
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					const text = await res.text();
					throw new Error("Failed to set main content language.", {
						cause: text,
					});
			}
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
		userAgent?: PrismicRepositoryUserAgents;
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
				"User-Agent": args.userAgent || SLICE_MACHINE_USER_AGENT,
				...extraHeaders,
			},
		});
	}
}

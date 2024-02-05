import * as t from "io-ts";
import * as tt from "io-ts-types";

import fetch from "../../lib/fetch";
import { decode } from "../../lib/decode";

import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";

import {
	UnauthenticatedError,
	UnauthorizedError,
	UnexpectedDataError,
} from "../../errors";

import { BaseManager } from "../BaseManager";

import { GitOwner, GitRepo, GitRepoSpecifier } from "./types";

type GitManagerCreateGitHubAuthStateReturnType = {
	key: string;
	expiresAt: Date;
};

type GitManagerFetchOwnersReturnType = GitOwner[];

type GitManagerFetchReposReturnType = GitRepo[];

type GitManagerFetchReposArgs = {
	provider: "gitHub";
	owner: string;
	query?: string;
	page?: number;
};

type GitManagerFetchLinkedReposArgs = {
	prismic: {
		domain: string;
	};
};

type GitManagerFetchLinkedReposReturnType = GitRepoSpecifier[];

type GitManagerLinkRepoArgs = {
	prismic: {
		domain: string;
	};
	git: {
		provider: "gitHub";
		owner: string;
		name: string;
	};
};

type GitManagerUnlinkRepoArgs = {
	prismic: {
		domain: string;
	};
	git: {
		provider: "gitHub";
		owner: string;
		name: string;
	};
};

type UpdateWriteAPITokenArgs = {
	prismic: {
		domain: string;
	};
	git: {
		provider: "gitHub";
		owner: string;
		name: string;
	};
	token: string;
};

type DeleteWriteAPITokenArgs = {
	prismic: {
		domain: string;
	};
	git: {
		provider: "gitHub";
		owner: string;
		name: string;
	};
};

export class GitManager extends BaseManager {
	async createGitHubAuthState(): Promise<GitManagerCreateGitHubAuthStateReturnType> {
		const url = new URL(
			"./git/github/create-auth-state",
			API_ENDPOINTS.SliceMachineV1,
		);
		const res = await this.#fetch(url, { method: "POST" });

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to create GitHub auth state.");
			}
		}

		const json = await res.json();
		const { value, error } = decode(
			t.type({
				key: t.string,
				expiresAt: tt.DateFromISOString,
			}),
			json,
		);

		if (error) {
			throw new UnexpectedDataError(
				`Failed to decode GitHub auth state: ${error.errors.join(", ")}`,
				{ cause: error },
			);
		}

		return value;
	}

	async fetchOwners(): Promise<GitManagerFetchOwnersReturnType> {
		const url = new URL("./git/owners", API_ENDPOINTS.SliceMachineV1);
		const res = await this.#fetch(url);

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to fetch owners.");
			}
		}

		const json = await res.json();
		const { value, error } = decode(
			t.type({
				owners: t.array(
					t.type({
						provider: t.literal("gitHub"),
						id: t.string,
						name: t.string,
						type: t.union([t.literal("user"), t.literal("team"), t.null]),
					}),
				),
			}),
			json,
		);

		if (error) {
			throw new UnexpectedDataError(
				`Failed to decode owners: ${error.errors.join(", ")}`,
				{ cause: error },
			);
		}

		return value.owners;
	}

	async fetchRepos(
		args: GitManagerFetchReposArgs,
	): Promise<GitManagerFetchReposReturnType> {
		const url = new URL("./git/repos", API_ENDPOINTS.SliceMachineV1);
		url.searchParams.set("provider", args.provider);
		url.searchParams.set("owner", args.owner);
		if (args.query) {
			url.searchParams.set("q", args.query);
		}
		if (args.page && args.page > 0) {
			url.searchParams.set("page", args.page.toString());
		}

		const res = await this.#fetch(url);

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to fetch repos.");
			}
		}

		const json = await res.json();
		const { value, error } = decode(
			t.type({
				repos: t.array(
					t.type({
						provider: t.literal("gitHub"),
						id: t.string,
						owner: t.string,
						name: t.string,
						url: t.string,
						pushedAt: tt.DateFromISOString,
					}),
				),
			}),
			json,
		);

		if (error) {
			throw new UnexpectedDataError(
				`Failed to decode repos: ${error.errors.join(", ")}`,
				{ cause: error },
			);
		}

		return value.repos;
	}

	async fetchLinkedRepos(
		args: GitManagerFetchLinkedReposArgs,
	): Promise<GitManagerFetchLinkedReposReturnType> {
		const url = new URL("./git/linked-repos", API_ENDPOINTS.SliceMachineV1);
		url.searchParams.set("repository", args.prismic.domain);

		const res = await this.#fetch(url);

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to fetch linked repos.");
			}
		}

		const json = await res.json();
		const { value, error } = decode(
			t.type({
				repos: t.array(
					t.type({
						provider: t.literal("gitHub"),
						owner: t.string,
						name: t.string,
					}),
				),
			}),
			json,
		);

		if (error) {
			throw new UnexpectedDataError(
				`Failed to decode linked repos: ${error.errors.join(", ")}`,
				{ cause: error },
			);
		}

		return value.repos;
	}

	async linkRepo(args: GitManagerLinkRepoArgs): Promise<void> {
		const url = new URL("./git/linked-repos", API_ENDPOINTS.SliceMachineV1);
		const res = await this.#fetch(url, {
			method: "PUT",
			body: {
				prismic: {
					domain: args.prismic.domain,
				},
				git: {
					provider: args.git.provider,
					owner: args.git.owner,
					name: args.git.name,
				},
			},
		});

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to link repos.");
			}
		}
	}

	async unlinkRepo(args: GitManagerUnlinkRepoArgs): Promise<void> {
		const url = new URL("./git/linked-repos", API_ENDPOINTS.SliceMachineV1);
		const res = await this.#fetch(url, {
			method: "DELETE",
			body: {
				prismic: {
					domain: args.prismic.domain,
				},
				git: {
					provider: args.git.provider,
					owner: args.git.owner,
					name: args.git.name,
				},
			},
		});

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to unlink repos.");
			}
		}
	}

	async updateWriteAPIToken(args: UpdateWriteAPITokenArgs): Promise<void> {
		const url = new URL(
			"./git/linked-repos/write-api-token",
			API_ENDPOINTS.SliceMachineV1,
		);
		const res = await this.#fetch(url, {
			method: "PUT",
			body: {
				prismic: {
					domain: args.prismic.domain,
				},
				git: {
					provider: args.git.provider,
					owner: args.git.owner,
					name: args.git.name,
				},
				token: args.token,
			},
		});

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to update Prismic Write API token.");
			}
		}
	}

	async deleteWriteAPIToken(args: DeleteWriteAPITokenArgs): Promise<void> {
		const url = new URL(
			"./git/linked-repos/write-api-token",
			API_ENDPOINTS.SliceMachineV1,
		);
		const res = await this.#fetch(url, {
			method: "DELETE",
			body: {
				prismic: {
					domain: args.prismic.domain,
				},
				git: {
					provider: args.git.provider,
					owner: args.git.owner,
					name: args.git.name,
				},
			},
		});

		if (!res.ok) {
			switch (res.status) {
				case 401:
					throw new UnauthenticatedError();
				case 403:
					throw new UnauthorizedError();
				default:
					throw new Error("Failed to delete Prismic Write API token.");
			}
		}
	}

	async #fetch(
		url: URL,
		config?: {
			method?: "POST" | "PUT" | "DELETE";
			body?: unknown;
		},
	) {
		const authenticationToken = await this.user.getAuthenticationToken();

		return await fetch(url, {
			method: config?.method,
			body: config?.body ? JSON.stringify(config.body) : undefined,
			headers: {
				Authorization: `Bearer ${authenticationToken}`,
			},
		});
	}
}

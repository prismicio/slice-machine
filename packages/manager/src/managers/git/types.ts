import { GitProvider } from "../../constants/GIT_PROVIDER";

export type GitOwner = {
	provider: GitProvider;
	id: string;
	name: string;
	// If type is null, the owner's type could not be determined. This can
	// happen if a Git provider uses an owner type that we do not support.
	// Owners with a null type should still be usable like any other owner.
	type: "user" | "team" | null;
};

export type GitRepo = {
	provider: GitProvider;
	id: string;
	owner: string;
	name: string;
	url: string;
	pushedAt: Date;
};

export type GitRepoSpecifier = {
	provider: GitProvider;
	owner: string;
	name: string;
};

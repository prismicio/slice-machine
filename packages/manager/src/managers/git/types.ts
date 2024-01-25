export type GitOwner = {
	provider: "gitHub";
	id: string;
	name: string;
	type: "user" | "team" | null;
};

export type GitRepo = {
	provider: "gitHub";
	id: string;
	owner: string;
	name: string;
	url: string;
	pushedAt: Date;
};

export type GitRepoSpecifier = {
	provider: "gitHub";
	owner: string;
	name: string;
};

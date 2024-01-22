export type Owner = {
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

export type GitRepoSpcifier = {
	provider: "gitHub";
	owner: string;
	name: string;
};

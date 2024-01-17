export type Namespace = {
	id: string;
	name: string;
	type: "user" | "team" | null;
};

export type GitRepo = {
	id: string;
	owner: string;
	name: string;
	url: string;
	pushedAt: Date;
};

export type GitRepoSpcifier = {
	owner: string;
	name: string;
};

export const GIT_PROVIDER = {
	GitHub: "gitHub",
} as const;

export type GitProvider = (typeof GIT_PROVIDER)[keyof typeof GIT_PROVIDER];

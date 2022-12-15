import * as t from "io-ts";

export const PrismicRepositoryUserAgent = {
	SliceMachine: "prismic-cli/sm",
	LegacyZero: "prismic-cli/0",
} as const;
export type PrismicRepositoryUserAgents =
	typeof PrismicRepositoryUserAgent[keyof typeof PrismicRepositoryUserAgent];

export const PrismicRepositoryRole = {
	SuperUser: "SuperUser",
	Administrator: "Administrator",
	Owner: "Owner",
	Manager: "Manager",
	Publisher: "Publisher",
	Writer: "Writer",
	Readonly: "Readonly",
} as const;
export type PrismicRepositoryRoles =
	typeof PrismicRepositoryRole[keyof typeof PrismicRepositoryRole];

export const PrismicRepository = t.type({
	domain: t.string,
	name: t.string,
	role: t.union([
		t.keyof(PrismicRepositoryRole),
		t.record(t.string, t.keyof(PrismicRepositoryRole)),
	]),
});
export type PrismicRepository = t.TypeOf<typeof PrismicRepository>;

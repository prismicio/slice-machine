import * as z from "zod";

export enum PrismicRepositoryRole {
	SuperUser = "SuperUser",
	Administrator = "Administrator",
	Owner = "Owner",
	Manager = "Manager",
	Publisher = "Publisher",
	Writer = "Writer",
	Readonly = "Readonly",
}

export type PrismicRepositoryRoles = PrismicRepositoryRole;

export const PrismicRepositorySchema = z.object({
	domain: z.string(),
	name: z.string(),
	role: z.union([
		z.enum(PrismicRepositoryRole),
		z.record(z.string(), z.enum(PrismicRepositoryRole)),
	]),
});
export type PrismicRepository = z.infer<typeof PrismicRepositorySchema>;

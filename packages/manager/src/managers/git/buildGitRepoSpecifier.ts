import { GitRepoSpecifier } from "./types";

/**
 * Builds a Git repository specifier from its individual parts.
 *
 * @example
 *
 * ```typescript
 * buildGitRepoSpecifier({
 * 	provider: "gitHub",
 * 	owner: "foo",
 * 	name: "bar",
 * });
 * ```
 *
 * @param repoSpecifier - The Git repository specifier.
 *
 * @returns The specifier in the form of `provider@owner/name`.
 */
export const buildGitRepoSpecifier = (
	repoSpecifier: GitRepoSpecifier,
): string => {
	return `${repoSpecifier.provider}@${repoSpecifier.owner}/${repoSpecifier.name}`;
};

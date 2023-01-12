import { it, expect } from "vitest";

import { formatRepositoryDomain } from "../src/lib/repositoryDomain";

it("formats repository domain", () => {
	const result = "foo-bar-baz";
	// Valid
	expect(formatRepositoryDomain("foo-bar-baz")).toBe(result);
	// Replaces whitespaces
	expect(formatRepositoryDomain("foo bar baz")).toBe(result);
	// Replaces underscores
	expect(formatRepositoryDomain("foo_bar_baz")).toBe(result);
	// Lowercases everything
	expect(formatRepositoryDomain("Foo-BAR-baz")).toBe(result);
	// Trim whitespaces, underscores, and hyphens
	expect(formatRepositoryDomain(" __-Foo-BAR-baz   ")).toBe(result);
	// Dedupes hyphesn
	expect(formatRepositoryDomain("foo----bar---baz")).toBe(result);
});

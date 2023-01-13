import { it, expect } from "vitest";

import { validateRepositoryDomain } from "../src/lib/repositoryDomain";

it("validates repository domain", () => {
	// Valid
	expect(validateRepositoryDomain({ domain: "foo-bar" }).hasErrors).toBe(false);
	// Too short
	expect(validateRepositoryDomain({ domain: "s" }).hasErrors).toBe(true);
	// Too long
	expect(
		validateRepositoryDomain({
			domain:
				"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum",
		}).hasErrors,
	).toBe(true);
});

it("handles only already formatted repository domain", () => {
	expect(() =>
		validateRepositoryDomain({ domain: "Foo Bar " }),
	).toThrowErrorMatchingInlineSnapshot(
		'"`validateRepositoryDomain()` can only validate formatted repository domains, use the `formatRepositoryDomain()` first."',
	);
});

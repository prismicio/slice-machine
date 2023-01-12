import { it, expect } from "vitest";

import { validateRepositoryDomainAndAvailability } from "../src/lib/repositoryDomain";

it("validates repository domain", async () => {
	// Valid
	expect(
		(
			await validateRepositoryDomainAndAvailability({
				domain: "foo-bar",
				existsFn: () => false,
			})
		).hasErrors,
	).toBe(false);
	// Too short
	expect(
		(
			await validateRepositoryDomainAndAvailability({
				domain: "s",
				existsFn: () => false,
			})
		).hasErrors,
	).toBe(true);
	// Too long
	expect(
		(
			await validateRepositoryDomainAndAvailability({
				domain:
					"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum",
				existsFn: () => false,
			})
		).hasErrors,
	).toBe(true);
	// Exists
	expect(
		(
			await validateRepositoryDomainAndAvailability({
				domain:
					"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum",
				existsFn: () => true,
			})
		).hasErrors,
	).toBe(true);
});

it("handles only already formatted repository domain", async () => {
	await expect(
		validateRepositoryDomainAndAvailability({
			domain: "Foo Bar ",
			existsFn: () => false,
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"`validateRepositoryDomainAndAvailability()` can only validate formatted repository domains, use the `formatRepositoryDomain()` first."',
	);
});

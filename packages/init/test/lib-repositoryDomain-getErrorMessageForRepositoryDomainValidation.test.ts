import { it, expect } from "vitest";

import {
	validateRepositoryDomainAndAvailability,
	getErrorMessageForRepositoryDomainValidation,
} from "../src/lib/repositoryDomain";

it("gets an error message when there is validation errors for the repository domain", async () => {
	const tooShortValidation = await validateRepositoryDomainAndAvailability({
		domain: "s",
		existsFn: () => false,
	});
	expect(
		getErrorMessageForRepositoryDomainValidation({
			validation: tooShortValidation,
			displayDomain: "s",
		}),
	).toMatchInlineSnapshot(
		'"Repository name s must be 4 characters long or more"',
	);

	const tooLongValidation = await validateRepositoryDomainAndAvailability({
		domain:
			"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum",
		existsFn: () => false,
	});
	expect(
		getErrorMessageForRepositoryDomainValidation({
			validation: tooLongValidation,
			displayDomain:
				"lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum",
		}),
	).toMatchInlineSnapshot(
		'"Repository name lorem-ipsum-dolor-sit-amet-consectetur-adipisicing-elit-officiis-incidunt-ex-harum must be 63 characters long or less"',
	);

	const existsValidation = await validateRepositoryDomainAndAvailability({
		domain: "foo-bar",
		existsFn: () => true,
	});
	expect(
		getErrorMessageForRepositoryDomainValidation({
			validation: existsValidation,
			displayDomain: "foo-bar",
		}),
	).toMatchInlineSnapshot('"Repository name foo-bar is already taken"');

	// Unhandled
	expect(
		getErrorMessageForRepositoryDomainValidation({
			validation: {
				hasErrors: true,
				// @ts-expect-error - testing unhandled error on purpose
				UnhandledError: true,
			},
			displayDomain: "foo-bar",
		}),
	).toMatchInlineSnapshot(
		'"Repository name foo-bar has unhandled errors {\\"hasErrors\\":true,\\"UnhandledError\\":true}"',
	);
});

it("returns `null` when validation has no errors", async () => {
	const validation = await validateRepositoryDomainAndAvailability({
		domain: "foo-bar",
		existsFn: () => false,
	});
	expect(
		getErrorMessageForRepositoryDomainValidation({
			validation,
			displayDomain: "foo-bar",
		}),
	).toBe(null);
});

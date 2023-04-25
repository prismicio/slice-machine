import { it, expect } from "vitest";

import { getRandomRepositoryDomain } from "../src/lib/repositoryDomain";

it("gets random repository domain", () => {
	const first = getRandomRepositoryDomain();
	const second = getRandomRepositoryDomain();

	expect(first.split("-").length).toBe(3);
	expect(second.split("-").length).toBe(3);
	expect(first).not.toBe(second);
});

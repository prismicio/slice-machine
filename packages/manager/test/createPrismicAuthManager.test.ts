import { expect, it } from "vitest";

import { createPrismicAuthManager, PrismicAuthManager } from "../src";

it("creates a PrismicAuthManager", () => {
	const prismicAuthManager = createPrismicAuthManager();

	expect(prismicAuthManager).toBeInstanceOf(PrismicAuthManager);
});

import { expect, it } from "vitest";

import { createPrismicAuthManager } from "../src";
import { PrismicAuthManager } from "../src/auth/PrismicAuthManager";

it("creates a PrismicAuthManager", () => {
	const prismicAuthManager = createPrismicAuthManager();

	expect(prismicAuthManager).toBeInstanceOf(PrismicAuthManager);
});

import { expect, it } from "vitest";

import { createSliceMachineManager } from "../src";
import { PrismicAuthManager } from "../src/auth/PrismicAuthManager";

it("returns the manager's PrismicAuthManager", () => {
	const manager = createSliceMachineManager();

	const prismicAuthManager = manager.getPrismicAuthManager();

	expect(prismicAuthManager).toBeInstanceOf(PrismicAuthManager);
});

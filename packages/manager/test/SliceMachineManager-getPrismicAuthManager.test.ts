import { expect, it } from "vitest";

import { createSliceMachineManager, PrismicAuthManager } from "../src";

it("returns the manager's PrismicAuthManager", () => {
	const manager = createSliceMachineManager();

	const prismicAuthManager = manager.getPrismicAuthManager();

	expect(prismicAuthManager).toBeInstanceOf(PrismicAuthManager);
});

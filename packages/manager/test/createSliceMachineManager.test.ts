import { expect, it } from "vitest";

import { createSliceMachineManager, SliceMachineManager } from "../src";

it("creates a SliceMachineManager", () => {
	const manager = createSliceMachineManager();

	expect(manager).toBeInstanceOf(SliceMachineManager);
});

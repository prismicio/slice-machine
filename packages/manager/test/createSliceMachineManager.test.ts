import { expect, it } from "vitest";

import { createSliceMachineManager } from "../src";
import { SliceMachineManager } from "../src/managers/SliceMachineManager";

it("creates a SliceMachineManager", () => {
	const manager = createSliceMachineManager();

	expect(manager).toBeInstanceOf(SliceMachineManager);
});

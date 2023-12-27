import { describe, expect, it } from "vitest";
import {
	isSliceMachineError,
	isUnauthenticatedError,
	SliceMachineError,
	UnauthenticatedError,
} from "../src/errors";

describe("SliceMachineError", () => {
	it("identifies a SliceMachineError", async () => {
		const error = new SliceMachineError();
		expect(isSliceMachineError(error)).toBe(true);
	});

	it("does not confuse a base Error", async () => {
		const error = new Error();
		expect(isSliceMachineError(error)).toBe(false);
	});
});

describe("UnauthenticatedError", () => {
	it("identifies a UnauthenticatedError", async () => {
		const error = new UnauthenticatedError();
		expect(isUnauthenticatedError(error)).toBe(true);
	});

	it("does not confuse a SliceMachineError", async () => {
		const error = new SliceMachineError();
		expect(isUnauthenticatedError(error)).toBe(false);
	});
});

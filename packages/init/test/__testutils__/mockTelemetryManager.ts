import { SpyInstance, vi } from "vitest";

import { SliceMachineInitProcess } from "../../src/SliceMachineInitProcess";

export const mockTelemetryManager = (
	initProcess: SliceMachineInitProcess,
): {
	identify: SpyInstance;
	track: SpyInstance;
} => {
	// @ts-expect-error - Accessing protected method
	const manager = initProcess.manager;

	const identify = vi
		.spyOn(manager.telemetry, "identify")
		.mockImplementation(vi.fn(() => Promise.resolve()));

	const track = vi
		.spyOn(manager.telemetry, "track")
		.mockImplementation(vi.fn(() => Promise.resolve()));

	return {
		identify,
		track,
	};
};

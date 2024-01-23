import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

const mocks = vi.hoisted(() => {
	return {
		exposure: vi.fn(),
	};
});

vi.mock("@amplitude/experiment-js-client", () => {
	const MockAmplitudeClient = {
		start: vi.fn(() => Promise.resolve()),
		exposure: mocks.exposure,
	};

	const MockExperiment = {
		initialize: vi.fn(() => MockAmplitudeClient),
	};

	return {
		Experiment: MockExperiment,
		ExperimentClient: MockAmplitudeClient,
	};
});

it("set the experiment variant as exposed", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	await manager.telemetry.experimentExposure("test-variant");

	expect(mocks.exposure).toHaveBeenCalledWith("test-variant");
});

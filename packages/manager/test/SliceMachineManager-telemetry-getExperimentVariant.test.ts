import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

vi.mock("@amplitude/experiment-node-server", () => {
	const MockAmplitudeClient = {
		fetchV2: vi.fn(() => {
			return {
				"test-variant-on": {
					value: "on",
				},
				"test-variant-off": {
					value: "off",
				},
			};
		}),
	};

	const MockExperiment = {
		initializeRemote: vi.fn(() => MockAmplitudeClient),
	};

	return {
		Experiment: MockExperiment,
		RemoteEvaluationClient: MockAmplitudeClient,
	};
});

it("get the experiment 'on' value for a specific variant", async () => {
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

	const experimentVariant =
		await manager.telemetry.getExperimentVariant("test-variant-on");

	expect(experimentVariant).toEqual({ value: "on" });
});

it("get the experiment 'off' value for a specific variant", async () => {
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

	const experimentVariant =
		await manager.telemetry.getExperimentVariant("test-variant-off");

	expect(experimentVariant).toEqual({ value: "off" });
});

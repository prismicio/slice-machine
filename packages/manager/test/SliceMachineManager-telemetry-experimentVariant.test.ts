import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

vi.mock("@amplitude/experiment-js-client", () => {
	const MockAmplitudeClient = {
		start: vi.fn(() => Promise.resolve()),
		fetch: vi.fn(),
		variant: vi.fn((variant: string) => {
			if (variant === "test-variant-on") {
				return {
					value: "on",
				};
			} else {
				return {
					value: "off",
				};
			}
		}),
	};

	const MockExperiment = {
		initialize: vi.fn(() => MockAmplitudeClient),
	};

	return {
		Experiment: MockExperiment,
		ExperimentClient: MockAmplitudeClient,
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
		await manager.telemetry.experimentVariant("test-variant-on");

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
		await manager.telemetry.experimentVariant("test-variant-off");

	expect(experimentVariant).toEqual({ value: "off" });
});

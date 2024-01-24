import { beforeAll, expect, it } from "vitest";
import { RemoteEvaluationClient } from "@amplitude/experiment-node-server";
import { Analytics } from "@segment/analytics-node";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

beforeAll(() => {
	const originalProcessEnv = process.env;

	// rc9 respects the user's configuration directory using `XDG_CONFIG_HOME`.
	process.env.XDG_CONFIG_HOME = os.homedir();

	return () => {
		process.env = originalProcessEnv;
	};
});

it("creates a reusable Segment client", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._segmentClient).toBe(undefined);

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._segmentClient()).toBeInstanceOf(Analytics);

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._segmentClient()._publisher._disable).toBe(false);
});

it("disables the Segment client if .prismicrc is configured to disable telemetry", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.writeFile(path.join(os.homedir(), ".prismicrc"), "telemetry=false");

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._segmentClient()._publisher._disable).toBe(true);
});

it("creates a reusable Experiment client", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._experiment).toBeUndefined();

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._experiment).toBeInstanceOf(RemoteEvaluationClient);
});

it("disables the Experiment client if .prismicrc is configured to disable telemetry", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.writeFile(path.join(os.homedir(), ".prismicrc"), "telemetry=false");

	await manager.telemetry.initTelemetry({
		appName: "slice-machine-ui",
		appVersion: "0.0.1-test",
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._experiment).toBeUndefined();
});

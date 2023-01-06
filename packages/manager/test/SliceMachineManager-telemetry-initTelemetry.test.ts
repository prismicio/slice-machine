import { beforeAll, expect, it } from "vitest";
import SegmentClient from "analytics-node";
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

	await manager.telemetry.initTelemetry();

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._segmentClient).toBeInstanceOf(SegmentClient);
});

it("disables the Segment client if .prismicrc is configured to disable telemery", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.writeFile(path.join(os.homedir(), ".prismicrc"), "telemetry=false");

	await manager.telemetry.initTelemetry();

	// @ts-expect-error - Accessing an internal private property
	expect(manager.telemetry._segmentClient.enable).toBe(false);
});

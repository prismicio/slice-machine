import { beforeAll, expect, it } from "vitest";
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

it("returns default telemetry state", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await expect(manager.telemetry.checkIsTelemetryEnabled()).resolves.toBe(true);
});

it("returns telemetry state honoring local `.prismicrc`", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.writeFile(path.join(os.homedir(), ".prismicrc"), "telemetry=false");

	await expect(manager.telemetry.checkIsTelemetryEnabled()).resolves.toBe(
		false,
	);
});

it("returns telemetry state honoring global `.prismicrc`", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.writeFile(path.join(cwd, ".prismicrc"), "telemetry=false");

	await expect(manager.telemetry.checkIsTelemetryEnabled()).resolves.toBe(
		false,
	);
});

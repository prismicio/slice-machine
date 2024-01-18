import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { watchStd } from "./__testutils__/watchStd";

import { createSliceMachineManager } from "../src";

it("installs dependencies", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const { stdout } = await watchStd(async () => {
		const { execaProcess } = await manager.project.installDependencies({
			dependencies: { express: "^1.0.0" },
		});

		await execaProcess;
	});

	expect(stdout.join("\n")).toMatch(
		/mock command ran: npm i express@\^1\.0\.0/i,
	);
});

it("installs dev dependencies", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const { stdout } = await watchStd(async () => {
		const { execaProcess } = await manager.project.installDependencies({
			dependencies: { express: "^1.0.0" },
			dev: true,
		});

		await execaProcess;
	});

	expect(stdout.join("\n")).toMatch(
		/mock command ran: npm i -D express@\^1\.0\.0/i,
	);
});

it("supports different package manager", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const { stdout } = await watchStd(async () => {
		const { execaProcess } = await manager.project.installDependencies({
			dependencies: { express: "^1.0.0" },
			packageManager: "yarn",
		});

		await execaProcess;
	});

	expect(stdout.join("\n")).toMatch(
		/mock command ran: yarn add express@\^1\.0\.0/i,
	);
});

it("supports different logging function", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const log = vi.fn();

	const { stdout } = await watchStd(async () => {
		const { execaProcess } = await manager.project.installDependencies({
			dependencies: { express: "^1.0.0" },
			log,
		});

		await execaProcess;
	});

	expect(stdout.length).toBe(0);
	expect(log).toHaveBeenCalledOnce();
	expect(log).toHaveBeenLastCalledWith(
		expect.stringMatching(/mock command ran: npm i express@\^1\.0\.0/i),
	);
});

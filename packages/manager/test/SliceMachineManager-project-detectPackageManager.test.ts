import { expect, it } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs/promises";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns the project's package manager", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.writeFile(path.join(cwd, "package-lock.json"), JSON.stringify({}));

	const packageManager1 = await manager.project.detectPackageManager();
	expect(packageManager1).toBe("npm");

	await fs.rm(path.join(cwd, "package-lock.json"));
	await fs.writeFile(path.join(cwd, "yarn.lock"), JSON.stringify({}));

	const packageManager2 = await manager.project.detectPackageManager();
	expect(packageManager2).toBe("yarn");
});

it("supports different project root", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.writeFile(path.join(cwd, "package-lock.json"), JSON.stringify({}));
	await fs.mkdir(path.join(cwd, "tmp"));
	await fs.writeFile(path.join(cwd, "tmp/yarn.lock"), JSON.stringify({}));

	const packageManager = await manager.project.detectPackageManager({
		root: path.join(cwd, "tmp"),
	});
	expect(packageManager).toBe("yarn");
});

it("falls back to npm as a package manager", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const packageManager = await manager.project.detectPackageManager();
	expect(packageManager).toBe("npm");
});

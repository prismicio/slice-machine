import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import path from "node:path";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns true if the project is configured for TypeScript", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const root = await manager.project.getRoot();
	await fs.writeFile(path.join(root, "tsconfig.json"), JSON.stringify({}));

	const isTypeScript = await manager.project.checkIsTypeScript();

	expect(isTypeScript).toBe(true);
});

it("returns false if the project is not configured for TypeScript", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const root = await manager.project.getRoot();
	try {
		await fs.rm(path.join(root, "tsconfig.json"));
	} catch {
		// This try...catch statement only exists to really make sure
		// the project doesn't have a TypeScript config file. We don't
		// care if it fails.
	}

	const isTypeScript = await manager.project.checkIsTypeScript();

	expect(isTypeScript).toBe(false);
});

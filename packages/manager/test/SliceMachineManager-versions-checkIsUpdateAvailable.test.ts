import { expect, it, vi } from "vitest";
import * as fs from "fs/promises";
import * as path from "node:path";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockNPMRegistryAPI } from "./__testutils__/mockNPMRegistryAPI";

import { createSliceMachineManager } from "../src";

const getMockSliceMachinePackageJSONPath = vi.fn();

vi.mock("module", async () => {
	const actual = (await vi.importActual(
		"node:module",
	)) as typeof import("node:module");

	return {
		...actual,
		createRequire: (...args: Parameters<typeof actual["createRequire"]>) => {
			const actualCreateRequire = actual.createRequire(...args);

			return {
				...actualCreateRequire,
				resolve: (id: string) => {
					if (id === "slice-machine-ui/package.json") {
						const mockSliceMachinePackageJsonPath =
							getMockSliceMachinePackageJSONPath();

						if (mockSliceMachinePackageJsonPath) {
							return mockSliceMachinePackageJsonPath;
						}
					}

					return actualCreateRequire(id);
				},
			};
		},
	};
});

it("returns true if an update is available", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const root = await manager.project.getRoot();
	const sliceMachinePackageJSONPath = path.join(
		root,
		"node_modules",
		"slice-machine-ui",
		"package.json",
	);
	await fs.mkdir(path.join(root, "node_modules", "slice-machine-ui"), {
		recursive: true,
	});
	const packageJSON = {
		name: "slice-machine-ui",
		version: "1.0.0",
	};
	await fs.writeFile(sliceMachinePackageJSONPath, JSON.stringify(packageJSON));

	getMockSliceMachinePackageJSONPath.mockReturnValue(
		sliceMachinePackageJSONPath,
	);

	mockNPMRegistryAPI(ctx, {
		packageName: "slice-machine-ui",
		versions: ["1.0.0", "2.0.0"],
	});

	const res = await manager.versions.checkIsUpdateAvailable();

	expect(res).toStrictEqual(true);
});

it("returns false if an update is not available", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const root = await manager.project.getRoot();
	const sliceMachinePackageJSONPath = path.join(
		root,
		"node_modules",
		"slice-machine-ui",
		"package.json",
	);
	await fs.mkdir(path.join(root, "node_modules", "slice-machine-ui"), {
		recursive: true,
	});
	const packageJSON = {
		name: "slice-machine-ui",
		version: "1.0.0",
	};
	await fs.writeFile(sliceMachinePackageJSONPath, JSON.stringify(packageJSON));

	getMockSliceMachinePackageJSONPath.mockReturnValue(
		sliceMachinePackageJSONPath,
	);

	mockNPMRegistryAPI(ctx, {
		packageName: "slice-machine-ui",
		versions: ["1.0.0"],
	});

	const res = await manager.versions.checkIsUpdateAvailable();

	expect(res).toStrictEqual(false);
});

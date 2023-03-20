import { expect, it, vi } from "vitest";
import * as fs from "fs/promises";
import * as path from "node:path";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

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

it("returns the version of the project's Slice Machine UI", async () => {
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

	const version = await manager.versions.getRunningSliceMachineVersion();

	expect(version).toBe(packageJSON.version);
});

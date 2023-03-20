import { expect, it, vi } from "vitest";
import * as path from "node:path";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

const MOCK_SLICE_MACHINE_PACKAGE_JSON_PATH =
	"/foo/bar/baz/slice-machine-ui/package.json";

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
						return MOCK_SLICE_MACHINE_PACKAGE_JSON_PATH;
					}

					return actualCreateRequire(id);
				},
			};
		},
	};
});

it("returns the path to the project's Slice Machine UI directory", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const sliceMachineUIDir = await manager.project.locateSliceMachineUIDir();

	expect(sliceMachineUIDir).toBe(
		path.dirname(MOCK_SLICE_MACHINE_PACKAGE_JSON_PATH),
	);
});

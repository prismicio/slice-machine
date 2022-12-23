import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it.each([
	["SuperUser", true],
	["Administrator", true],
	["Owner", true],
	["Manager", false],
	["Publisher", false],
	["Writer", false],
	["Readonly", false],
])(
	"determines if a repository with user role %s is writable by the user",
	async (role, expected) => {
		const adapter = createTestPlugin();
		const cwd = await createTestProject({ adapter });
		const manager = createSliceMachineManager({
			nativePlugins: { [adapter.meta.name]: adapter },
			cwd,
		});

		const res = manager.prismicRepository.hasWriteAccess({
			domain: "foo",
			name: "Foo",
			role: role as Parameters<
				typeof manager.prismicRepository.hasWriteAccess
			>[0]["role"],
		});

		expect(res).toBe(expected);
	},
);

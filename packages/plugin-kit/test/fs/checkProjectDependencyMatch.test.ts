import { it, expect, vi, TestContext } from "vitest";
import * as path from "node:path";

import { checkProjectDependencyMatch } from "../../src/fs";

const createRequireMock =
	vi.fn<Parameters<(typeof import("node:module"))["createRequire"]>>();

vi.mock("module", async () => {
	const actual: typeof import("node:module") =
		await vi.importActual("node:module");

	return {
		...actual,
		createRequire: (...args: Parameters<(typeof actual)["createRequire"]>) => {
			try {
				const res = createRequireMock(...args);

				if (res !== undefined) {
					return res;
				}
			} catch {
				// noop - we tried to mock at least.
			}

			return actual.createRequire(...args);
		},
	};
});

type MockCreateRequireForProjectArgs = {
	dependency: string;
	packageJSON: {
		version: string;
	};
};
const mockCreateRequireForProjectOnce = (
	ctx: TestContext,
	args: MockCreateRequireForProjectArgs,
) => {
	createRequireMock.mockImplementationOnce((filename) => {
		if (
			typeof filename === "string" &&
			path.dirname(filename) === path.resolve(ctx.project.root)
		) {
			return (moduleID: string) => {
				if (moduleID === `${args.dependency}/package.json`) {
					return args.packageJSON;
				}
			};
		}

		throw new Error("not implemented");
	});
};

it("returns true if the project contains a dependency matching the given semver range", async (ctx) => {
	mockCreateRequireForProjectOnce(ctx, {
		dependency: ctx.task.name,
		packageJSON: {
			version: "1.2.3",
		},
	});

	const res = await checkProjectDependencyMatch({
		dependency: ctx.task.name,
		semverRange: ">=1.0.0",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(true);
});

it("returns false if the project does not contain a dependency matching the given semver range", async (ctx) => {
	mockCreateRequireForProjectOnce(ctx, {
		dependency: ctx.task.name,
		packageJSON: {
			version: "1.2.3",
		},
	});

	const noVersionMatchRes = await checkProjectDependencyMatch({
		dependency: ctx.task.name,
		semverRange: ">=2.0.0",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(noVersionMatchRes).toBe(false);

	// `createRequire` implementation is not mocked anymore for this call.
	const notInstalledRes = await checkProjectDependencyMatch({
		dependency: ctx.task.name,
		semverRange: ">=2.0.0",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(notInstalledRes).toBe(false);
});

import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns the project's repository name", async () => {
	const adapter = createTestPlugin();
	const testSliceMachineConfig = {
		repositoryName: "bar",
		apiEndpoint: "baz",
		adapter,
		libraries: ["./qux"],
		localSliceSimulatorURL: "quux",
		plugins: [],
	};
	const cwd = await createTestProject(testSliceMachineConfig);
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const repositoryName = await manager.project.getResolvedRepositoryName();

	expect(repositoryName).toBe(testSliceMachineConfig.repositoryName);
});

it("returns the project's environment if set", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "foo" }));
			hook("project:environment:update", () => void 0);
		},
	});
	const testSliceMachineConfig = {
		repositoryName: "bar",
		apiEndpoint: "baz",
		adapter,
		libraries: ["./qux"],
		localSliceSimulatorURL: "quux",
		plugins: [],
	};
	const cwd = await createTestProject(testSliceMachineConfig);
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const repositoryName = await manager.project.getResolvedRepositoryName();

	expect(repositoryName).toBe("foo");
});

it("returns the project's repository name if environment is undefined", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: undefined }));
			hook("project:environment:update", () => void 0);
		},
	});
	const testSliceMachineConfig = {
		repositoryName: "bar",
		apiEndpoint: "baz",
		adapter,
		libraries: ["./qux"],
		localSliceSimulatorURL: "quux",
		plugins: [],
	};
	const cwd = await createTestProject(testSliceMachineConfig);
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const repositoryName = await manager.project.getResolvedRepositoryName();

	expect(repositoryName).toBe(testSliceMachineConfig.repositoryName);
});

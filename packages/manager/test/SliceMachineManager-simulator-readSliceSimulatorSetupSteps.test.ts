import { beforeAll, expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { stubOniguruma } from "./__testutils__/stubOniguruma";

import { createSliceMachineManager } from "../src";

beforeAll(async () => {
	await stubOniguruma();
});

it("returns Slice Simulator set up steps with validation status", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-simulator:setup:read", () => {
				return [
					{
						title: "valid",
						description: "valid desc",
						body: "foo",
						validate: async () => void 0,
					},
					{
						title: "invalid-one-error",
						description: "invalid-one-error desc",
						body: "bar",
						validate: async () => {
							return { title: "title", message: "message" };
						},
					},
					{
						title: "invalid-multiple-errors",
						description: "invalid-multiple-errors desc",
						body: "baz",
						validate: async () => {
							return [
								{ title: "title1", message: "message1" },
								{ title: "title2", message: "message2" },
							];
						},
					},
					{
						title: "no-validator",
						description: "no-validator desc",
						body: "qux",
					},
				];
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.simulator.readSliceSimulatorSetupSteps();

	expect(res).toStrictEqual({
		steps: [
			{
				title: "valid",
				description: "valid desc",
				body: "<p>foo</p>",
				isComplete: true,
				validationMessages: [],
			},
			{
				title: "invalid-one-error",
				description: "invalid-one-error desc",
				body: "<p>bar</p>",
				isComplete: false,
				validationMessages: [
					{
						title: "title",
						message: "<p>message</p>",
					},
				],
			},
			{
				title: "invalid-multiple-errors",
				description: "invalid-multiple-errors desc",
				body: "<p>baz</p>",
				isComplete: false,
				validationMessages: [
					{
						title: "title1",
						message: "<p>message1</p>",
					},
					{
						title: "title2",
						message: "<p>message2</p>",
					},
				],
			},
			{
				title: "no-validator",
				description: "no-validator desc",
				body: "<p>qux</p>",
				isComplete: undefined,
				validationMessages: [],
			},
		],
		errors: [],
	});
});

it("supports optional descriptions", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-simulator:setup:read", () => {
				return [
					{
						title: "with description",
						description: "with description desc",
						body: "foo",
					},
					{
						title: "without description",
						body: "bar",
					},
				];
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.simulator.readSliceSimulatorSetupSteps();

	expect(res).toStrictEqual({
		steps: [
			{
				title: "with description",
				description: "with description desc",
				body: "<p>foo</p>",
				isComplete: undefined,
				validationMessages: [],
			},
			{
				title: "without description",
				description: undefined,
				body: "<p>bar</p>",
				isComplete: undefined,
				validationMessages: [],
			},
		],
		errors: [],
	});
});

it("supports Markdown with code syntax highlighting in a step's body", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-simulator:setup:read", () => {
				return [
					{
						title: "markdown-test",
						description: "markdown-test desc",
						body: `
# Heading 1
## Heading 2
### Heading 3

~~~ts
const foo = "bar";
~~~
						`.trim(),
					},
				];
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.simulator.readSliceSimulatorSetupSteps();

	expect(res).toStrictEqual({
		steps: [
			{
				title: "markdown-test",
				description: "markdown-test desc",
				body: `
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<div class="highlight highlight-ts"><pre><span class="pl-k">const</span> <span class="pl-c1">foo</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">"</span>bar<span class="pl-pds">"</span></span>;
</pre></div>
				`.trim(),
				isComplete: undefined,
				validationMessages: [],
			},
		],
		errors: [],
	});
});

it("supports Markdown with code syntax highlighting in a step's body", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-simulator:setup:read", () => {
				return [
					{
						title: "markdown-test",
						description: "markdown-test desc",
						body: "body",
						validate: () => {
							return {
								title: "invalid",
								message: `
# Heading 1
## Heading 2
### Heading 3

~~~ts
const foo = "bar";
~~~
								`.trim(),
							};
						},
					},
				];
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.simulator.readSliceSimulatorSetupSteps();

	expect(res).toStrictEqual({
		steps: [
			{
				title: "markdown-test",
				description: "markdown-test desc",
				body: "<p>body</p>",
				isComplete: false,
				validationMessages: [
					{
						title: "invalid",
						message: `
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<div class="highlight highlight-ts"><pre><span class="pl-k">const</span> <span class="pl-c1">foo</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">"</span>bar<span class="pl-pds">"</span></span>;
</pre></div>
					`.trim(),
					},
				],
			},
		],
		errors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.simulator.readSliceSimulatorSetupSteps();
	}).rejects.toThrow(/plugins have not been initialized/i);
});

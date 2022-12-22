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
						body: "foo",
						validate: async () => void 0,
					},
					{
						title: "invalid-one-error",
						body: "bar",
						validate: async () => {
							return { type: "Error", title: "title", message: "message" };
						},
					},
					{
						title: "invalid-multiple-errors",
						body: "baz",
						validate: async () => {
							return [
								{ type: "Error", title: "title1", message: "message1" },
								{ type: "Error", title: "title2", message: "message2" },
							];
						},
					},
					{
						title: "no-validator",
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
				body: "<p>foo</p>",
				isComplete: true,
				validationMessages: [],
			},
			{
				title: "invalid-one-error",
				body: "<p>bar</p>",
				isComplete: false,
				validationMessages: [
					{
						type: "Error",
						title: "title",
						message: "<p>message</p>",
					},
				],
			},
			{
				title: "invalid-multiple-errors",
				body: "<p>baz</p>",
				isComplete: false,
				validationMessages: [
					{
						type: "Error",
						title: "title1",
						message: "<p>message1</p>",
					},
					{
						type: "Error",
						title: "title2",
						message: "<p>message2</p>",
					},
				],
			},
			{
				title: "no-validator",
				body: "<p>qux</p>",
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
						body: "body",
						validate: () => {
							return {
								type: "Error",
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
				body: "<p>body</p>",
				isComplete: false,
				validationMessages: [
					{
						type: "Error",
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

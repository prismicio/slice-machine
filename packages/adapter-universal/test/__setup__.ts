import { vi, beforeEach } from "vitest";
import {
	createSliceMachinePluginRunner,
	SliceMachineConfig,
	SliceMachinePluginRunner,
	SliceMachineProject,
} from "@slicemachine/plugin-kit";
import { createMockFactory, MockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";

declare module "vitest" {
	export interface TestContext {
		project: SliceMachineProject & {
			config: {
				libraries: string[];
			};
		};
		pluginRunner: SliceMachinePluginRunner;
		mock: MockFactory;
	}
}

beforeEach(async (ctx) => {
	vi.clearAllMocks();

	await fs.mkdir(os.tmpdir(), { recursive: true });
	const root = await fs.mkdtemp(
		path.join(os.tmpdir(), `@slicemachine__adapter-next___`),
	);
	await fs.writeFile(path.join(root, "package.json"), JSON.stringify({}));

	const adapter = createMemoryAdapter();

	const config = {
		adapter: adapter.meta.name,
		libraries: ["./slices"],
		repositoryName: "qwerty",
		apiEndpoint: "https://qwerty.cdn.prismic.io/api/v2",
	} satisfies SliceMachineConfig;

	await fs.writeFile(
		path.join(root, "slicemachine.config.json"),
		JSON.stringify(config),
	);

	ctx.project = {
		root,
		config,
	};

	ctx.pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[adapter.meta.name]: adapter,
		},
	});

	ctx.mock = createMockFactory({ seed: ctx.task.name });

	await ctx.pluginRunner.init();

	return async () => {
		await fs.rm(ctx.project.root, { recursive: true });
	};
});

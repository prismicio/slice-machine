import { beforeEach } from "vitest";
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

import adapter, { PluginOptions } from "../src";
import * as pkg from "../package.json";

declare module "vitest" {
	export interface TestContext {
		project: SliceMachineProject & {
			config: {
				adapter: {
					resolve: string;
					options: PluginOptions;
				};
			};
		};
		pluginRunner: SliceMachinePluginRunner;
		mock: MockFactory;
	}
}

beforeEach(async (ctx) => {
	const tmpRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "@slicemachine__adapter-next___"),
	);

	const config = {
		adapter: {
			resolve: pkg.name,
			options: {},
		},
		libraries: ["./slices"],
		repositoryName: "qwerty",
		apiEndpoint: "https://qwerty.cdn.prismic.io/api/v2",
	} satisfies SliceMachineConfig;

	await fs.writeFile(
		path.join(tmpRoot, "slicemachine.config.json"),
		JSON.stringify(config),
	);

	ctx.project = {
		root: tmpRoot,
		config,
	};

	ctx.pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[pkg.name]: adapter,
		},
	});

	ctx.mock = createMockFactory({ seed: ctx.meta.name });

	await ctx.pluginRunner.init();

	return async () => {
		await fs.rm(ctx.project.root, { recursive: true });
	};
});

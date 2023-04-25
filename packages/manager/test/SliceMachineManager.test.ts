import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { CustomTypesManager } from "../src/managers/customTypes/CustomTypesManager";
import { PluginsManager } from "../src/managers/plugins/PluginsManager";
import { PrismicRepositoryManager } from "../src/managers/prismicRepository/PrismicRepositoryManager";
import { ProjectManager } from "../src/managers/project/ProjectManager";
import { ScreenshotsManager } from "../src/managers/screenshots/ScreenshotsManager";
import { SimulatorManager } from "../src/managers/simulator/SimulatorManager";
import { SlicesManager } from "../src/managers/slices/SlicesManager";
import { SnippetsManager } from "../src/managers/snippets/SnippetsManager";
import { TelemetryManager } from "../src/managers/telemetry/TelemetryManager";
import { UserManager } from "../src/managers/user/UserManager";
import { VersionsManager } from "../src/managers/versions/VersionsManager";

import { createSliceMachineManager } from "../src";

it("contains submanagers", () => {
	const manager = createSliceMachineManager();

	expect(manager.user).toBeInstanceOf(UserManager);
	expect(manager.prismicRepository).toBeInstanceOf(PrismicRepositoryManager);
	expect(manager.plugins).toBeInstanceOf(PluginsManager);
	expect(manager.project).toBeInstanceOf(ProjectManager);
	expect(manager.customTypes).toBeInstanceOf(CustomTypesManager);
	expect(manager.slices).toBeInstanceOf(SlicesManager);
	expect(manager.snippets).toBeInstanceOf(SnippetsManager);
	expect(manager.screenshots).toBeInstanceOf(ScreenshotsManager);
	expect(manager.simulator).toBeInstanceOf(SimulatorManager);
	expect(manager.versions).toBeInstanceOf(VersionsManager);
	expect(manager.telemetry).toBeInstanceOf(TelemetryManager);
});

it("accepts a record of native plugins for the plugin runner", async () => {
	const commandInitHook = () => void 0;
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("debug", commandInitHook);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const sliceMachinePluginRunner = manager.getSliceMachinePluginRunner();
	const registeredHooksForAdapter = sliceMachinePluginRunner?.hooksForOwner(
		adapter.meta.name,
	);

	expect(registeredHooksForAdapter).toContainEqual(
		expect.objectContaining({
			meta: expect.objectContaining({
				external: commandInitHook,
				owner: adapter.meta.name,
				type: "debug",
			}),
		}),
	);
});

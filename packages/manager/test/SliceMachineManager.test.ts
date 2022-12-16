import { expect, it } from "vitest";

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

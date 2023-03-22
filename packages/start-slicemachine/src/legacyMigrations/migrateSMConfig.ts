import * as path from "node:path";
import * as fs from "node:fs/promises";

import {
	locateFileUpward,
	SLICE_MACHINE_CONFIG_FILENAME,
} from "@slicemachine/manager";
import { SliceMachineConfig } from "@slicemachine/plugin-kit";

// TODO: MIGRATION - Move this to the Migration Manager
export const migrateSMConfig = async (cwd: string): Promise<void> => {
	// Should we not override new config file if also present?
	const SLICE_MACHINE_DEPRECATED_CONFIG_FILENAME = "sm.json";

	const maybeDeprecatedConfigPath = await locateFileUpward(
		SLICE_MACHINE_DEPRECATED_CONFIG_FILENAME,
		{
			startDir: cwd,
		},
	);
	if (maybeDeprecatedConfigPath) {
		const newConfigPath = path.join(cwd, SLICE_MACHINE_CONFIG_FILENAME);
		// TODO is it worth finding old typed method getting this
		const oldConfig = JSON.parse(
			(await fs.readFile(maybeDeprecatedConfigPath)).toString(),
		);

		// TODO should we fail if _latest is before 0.6?

		const newConfig: SliceMachineConfig = {
			repositoryName: oldConfig.apiEndpoint.match(/https:\/\/([^\.]*).*/)[1], // TODO remove with https://linear.app/prismic/issue/SMX-119/aauser-i-want-to-keep-using-apiendpoint-inside-config-file-instead-of
			adapter: "@slicemachine/adapter-next", // TODO https://linear.app/prismic/issue/SMX-109/aauser-i-want-my-smjson-to-be-migrated-and-see-a-message-to-install
			libraries: oldConfig.libraries, // TODO format needs change, no @ and stuff - https://linear.app/prismic/issue/SMX-107/aauser-i-want-to-get-notified-that-my-libraryid-cannot-start-with
			localSliceSimulatorURL: oldConfig.localSliceSimulatorURL,
			apiEndpoint: oldConfig.apiEndpoint,
		};

		fs.writeFile(newConfigPath, JSON.stringify(newConfig, undefined, 2));
		fs.unlink(maybeDeprecatedConfigPath);
	}
};

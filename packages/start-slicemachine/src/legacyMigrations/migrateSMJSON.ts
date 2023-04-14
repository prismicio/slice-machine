import * as path from "node:path";
import * as fs from "node:fs/promises";

import chalk from "chalk";
import semver from "semver";

import { SliceMachineManager, SliceMachineConfig } from "@slicemachine/manager";

import { locateFileUpward } from "../lib/locateFileUpward";
import {
	Framework,
	FRAMEWORKS,
	UNIVERSAL,
	detectFramework,
} from "./detectFramework";

export const migrateSMJSON = async (
	manager: SliceMachineManager,
): Promise<void> => {
	let smJSONPath: string | undefined;

	try {
		smJSONPath = await locateFileUpward("sm.json", { startDir: manager.cwd });
	} catch (error) {
		// noop - sm.json does not exists
	}

	// Exit if sm.json is not found
	if (!smJSONPath) {
		return;
	}

	const smJSON = JSON.parse(await fs.readFile(smJSONPath, "utf-8"));

	// Exit if sm.json was migrated
	if ("//" in smJSON && !("libraries" in smJSON)) {
		// eslint-disable-next-line no-console
		return console.log(`
${chalk.bgYellow(` ${chalk.black("WARN")} `)} ${chalk.magenta(
			"sm.json",
		)} is deprecated!

  - If you were importing values from this file, please now import
    them from ${chalk.magenta("slicemachine.config.json")}.
    You can safely delete this file after to suppress this warning.

  - If you weren't, you can safely delete this file to suppress
    this warning.
`);
	}

	// TODO: Decide on how to handle really old migrations (1+ year)
	// Warn on old latest
	if (smJSON._latest && !semver.satisfies(smJSON._latest, ">0.3.0")) {
		// eslint-disable-next-line no-console
		console.log(
			`\n${chalk.bgYellow(` ${chalk.black("WARN")} `)} ${chalk.magenta(
				"sm.json",
			)} was last migrated before ${chalk.magenta(
				"0.3.0",
			)}, migration might be incomplete`,
		);
	}

	// eslint-disable-next-line no-console
	console.log(
		`\n${chalk.bgCyan(
			` ${chalk.black("INFO")} `,
		)} Detected deprecated ${chalk.magenta("sm.json")}, beginning migration...`,
	);

	// Define new slicemachine.config.json
	let framework: Framework;
	if (smJSON.framework) {
		framework = FRAMEWORKS[smJSON.framework] || UNIVERSAL;
	} else {
		framework = await detectFramework(path.dirname(smJSONPath));
	}

	const libraries: string[] =
		smJSON.libraries.map((library: string) => {
			// Migrate `@/` and `~/` libraries to `./`
			if (/^[@~]\//.test(library)) {
				return library.replace(/^[@~]\//, "./");
			}

			return library;
		}) || [];

	const sliceMachineConfig: SliceMachineConfig = {
		apiEndpoint: smJSON.apiEndpoint,
		// Infer repository name from API endpoint
		repositoryName: new URL(smJSON.apiEndpoint).host.split(".")[0],
		adapter: framework.adapterName,
		libraries,
	};

	if (smJSON.localSliceSimulatorURL) {
		sliceMachineConfig.localSliceSimulatorURL = smJSON.localSliceSimulatorURL;
	}

	// Write new slicemachine.config.json
	const sliceMachineConfigPath =
		await manager.project.suggestSliceMachineConfigPath();

	await manager.project.writeSliceMachineConfig({
		config: sliceMachineConfig,
		path: sliceMachineConfigPath,
	});

	// Update old sm.json
	await fs.writeFile(
		smJSONPath,
		JSON.stringify(
			{
				"//": "sm.json is deprecated, if you were importing values from this file please now import them from slicemachine.config.json, else you can safely delete this file",
				// We keep API endpoint in it because users might have been importing it from this file.
				apiEndpoint: smJSON.apiEndpoint,
			},
			undefined,
			"	",
		),
	);

	// Installing adapter
	try {
		const { execaProcess } = await manager.project.installDependencies({
			dependencies: {
				[framework.adapterName]: framework.adapterVersion,
			},
			dev: true,
			log: () => {
				/* ... */
			},
		});
		await execaProcess;
	} catch (error) {
		if (
			error instanceof Error &&
			"shortMessage" in error &&
			"stderr" in error
		) {
			throw new Error(`${error.shortMessage}\n\n${error.stderr}`, {
				cause: error,
			});
		}
		throw error;
	}

	if (framework.runProjectInitHook) {
		await manager.plugins.initPlugins();
		await manager.project.initProject({
			log: () => {
				/* Init silently, will throw if any error */
			},
		});
	}

	// Warn about old sm.json
	// eslint-disable-next-line no-console
	return console.log(`
${chalk.bgCyan(` ${chalk.black("INFO")} `)} Your ${chalk.magenta(
		"sm.json",
	)} content was automatically migrated to ${chalk.magenta(
		"slicemachine.config.json",
	)}

  - If you were importing values from this file, please now import
    them from ${chalk.magenta("slicemachine.config.json")}.
    You can safely delete this file after.

  - If you weren't, you can safely delete this file.
`);
};

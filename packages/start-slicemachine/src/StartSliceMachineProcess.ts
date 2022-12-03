import {
	PrismicUserProfile,
	SliceMachineManager,
	createSliceMachineManager,
} from "@slicemachine/core2";
import boxen from "boxen";
import chalk from "chalk";
import open from "open";
import { stripIndent } from "common-tags";

import { createSliceMachineServer } from "./lib/createSliceMachineServer";
import { listen } from "./lib/listen";

type CreateStartSliceMachineProcessArgs = ConstructorParameters<
	typeof StartSliceMachineProcess
>;

export const createStartSliceMachineProcess = (
	...args: CreateStartSliceMachineProcessArgs
): StartSliceMachineProcess => {
	return new StartSliceMachineProcess(...args);
};

export type StartSliceMachineProcessConstructorArgs = {
	open: boolean;
	port?: number;
};

export class StartSliceMachineProcess {
	sliceMachineManager: SliceMachineManager;
	open: boolean;
	port?: number;

	constructor(args: StartSliceMachineProcessConstructorArgs) {
		this.sliceMachineManager = createSliceMachineManager();

		this.open = args.open;
		this.port = args.port;
	}

	async run(): Promise<void> {
		await this.sliceMachineManager.plugins.initPlugins();

		await this._validateEnvironment();

		const server = await createSliceMachineServer({
			sliceMachineManager: this.sliceMachineManager,
		});
		const { address } = await listen(server, { port: this.port });
		const url = `http://localhost:${address.port}`;

		if (this.open) {
			await open(url);
		}

		const currentVersion =
			await this.sliceMachineManager.project.getRunningSliceMachineVersion();

		console.info(
			boxen(
				stripIndent`
				🍕 Slice Machine ${currentVersion} started.
				   Framework:      Unknown
				   Logged in as:   ${chalk.gray("Loading...")}
				   Running at:     http://localhost:${address.port}
			`,
				{
					padding: {
						top: 1,
						bottom: 1,
						left: 4,
						right: 5,
					},
					borderColor: "green",
					borderStyle: "round",
				}
			)
		);

		const profile = await this._fetchProfile();

		console.info(`Logged in as: ${profile?.email || "Not logged in"}`);
	}

	private async _validateEnvironment(): Promise<void> {
		// Validate Slice Machine config.
		await this.sliceMachineManager.project.loadSliceMachineConfig();

		// Validate Slice models.
		const allSlices = await this.sliceMachineManager.slices.readAllSlices();
		if (allSlices.errors.length > 0) {
			// TODO: Provide better error message.
			throw new Error(allSlices.errors.join(", "));
		}

		// Validate Custom Type models.
		const allCustomTypes =
			await this.sliceMachineManager.customTypes.readAllCustomTypes();
		if (allCustomTypes.errors.length > 0) {
			// TODO: Provide better error message.
			throw new Error(allCustomTypes.errors.join(", "));
		}
	}

	private async _fetchProfile(): Promise<PrismicUserProfile | undefined> {
		const isLoggedIn = await this.sliceMachineManager.user.checkIsLoggedIn();

		if (isLoggedIn) {
			return await this.sliceMachineManager.user.getProfile();
		}
	}
}

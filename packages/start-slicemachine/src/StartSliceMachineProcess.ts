/* eslint-disable no-console */

import {
	PrismicUserProfile,
	SliceMachineManager,
	createSliceMachineManager,
} from "@slicemachine/core2";
import chalk from "chalk";
import open from "open";

import { createSliceMachineServer } from "./lib/createSliceMachineServer";
import { listen } from "./lib/listen";

const DEFAULT_SERVER_PORT = 9999;

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

/**
 * Manages the process that runs Slice Machine's server.
 */
export class StartSliceMachineProcess {
	/**
	 * Determines if Slice Machine should automatically be opened once the server
	 * starts.
	 *
	 * @defaultValue `false`
	 */
	open?: boolean;

	/**
	 * The port on which to start the Slice Machine server.
	 *
	 * @defaultValue `9999`
	 */
	port?: number;

	/**
	 * The Slice Machine manager used for the process.
	 */
	private _sliceMachineManager: SliceMachineManager;

	constructor(args: StartSliceMachineProcessConstructorArgs) {
		this._sliceMachineManager = createSliceMachineManager();

		this.open = args.open ?? false;
		this.port = args.port ?? DEFAULT_SERVER_PORT;
	}

	/**
	 * Runs the process.
	 */
	async run(): Promise<void> {
		await this._sliceMachineManager.plugins.initPlugins();

		await this._validateProject();

		const server = await createSliceMachineServer({
			sliceMachineManager: this._sliceMachineManager,
		});
		const { address } = await listen(server, { port: this.port });
		const url = `http://localhost:${address.port}`;

		if (this.open) {
			await open(url);
		}

		console.log();
		console.log(
			await this._buildSliceMachineRunningLine(
				`Running at ${chalk.magenta(url)}`,
			),
		);
		console.log(this._buildLoggedInAsLine(chalk.dim("Loading...")));
		console.log();

		const profile = await this._fetchProfile();

		process.stdout.moveCursor(0, -2);
		process.stdout.clearLine(1);
		console.log(
			this._buildLoggedInAsLine(
				profile
					? `${[profile.firstName, profile.lastName]
							.filter(Boolean)
							.join(" ")} ${chalk.dim(`(${profile.email})`)}`
					: chalk.dim("Not logged in"),
			),
		);
		console.log();
	}

	/**
	 * Returns a string with Slice Machine info formatted for the console.
	 *
	 * @param value - Info to display.
	 *
	 * @returns String to pass to the console.
	 */
	private async _buildSliceMachineRunningLine(value: string): Promise<string> {
		const currentVersion =
			await this._sliceMachineManager.project.getRunningSliceMachineVersion();

		return `${chalk.bgBlack(
			` ${chalk.bold.white("Slice Machine")} ${chalk.magenta(
				`v${currentVersion}`,
			)} `,
		)} ${chalk.dim("→")} ${value}`;
	}

	/**
	 * Returns a string with logged in Prismic user info formatted for the
	 * console.
	 *
	 * @param value - User info to display.
	 *
	 * @returns String to pass to the console.
	 */
	private _buildLoggedInAsLine(value: string): string {
		return `${chalk.bgBlack(
			`         ${chalk.bold("Logged in as")} `,
		)} ${chalk.dim("→")} ${value}`;
	}

	/**
	 * Validates the project's config and content models.
	 *
	 * @throws Throws if a Slice model is invalid.
	 * @throws Throws if a Custom Type model is invalid.
	 */
	private async _validateProject(): Promise<void> {
		// Validate Slice Machine config.
		await this._sliceMachineManager.project.loadSliceMachineConfig();

		// Validate Slice models.
		const allSlices = await this._sliceMachineManager.slices.readAllSlices();
		if (allSlices.errors.length > 0) {
			// TODO: Provide better error message.
			throw new Error(allSlices.errors.join(", "));
		}

		// Validate Custom Type models.
		const allCustomTypes =
			await this._sliceMachineManager.customTypes.readAllCustomTypes();
		if (allCustomTypes.errors.length > 0) {
			// TODO: Provide better error message.
			throw new Error(allCustomTypes.errors.join(", "));
		}
	}

	/**
	 * Fetches the logged in Prismic user's profile. If the user is not logged in,
	 * `undefined` is returned.
	 *
	 * @returns The logged in Prismic user's profile, or `undefined` if not logged
	 *   in.
	 */
	private async _fetchProfile(): Promise<PrismicUserProfile | undefined> {
		const isLoggedIn = await this._sliceMachineManager.user.checkIsLoggedIn();

		if (isLoggedIn) {
			return await this._sliceMachineManager.user.getProfile();
		}
	}
}

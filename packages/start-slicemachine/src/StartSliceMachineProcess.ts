/* eslint-disable no-console */

import type { AddressInfo } from "node:net";
import chalk from "chalk";
import open from "open";
import os from "node:os";

import {
	PrismicUserProfile,
	SliceMachineManager,
	createSliceMachineManager,
} from "@slicemachine/manager";

import { createSliceMachineExpressApp } from "./lib/createSliceMachineExpressApp";
import { setupSentry } from "./lib/setupSentry";
import { migrateSMJSON } from "./legacyMigrations/migrateSMJSON";
import { migrateAssets } from "./legacyMigrations/migrateAssets";
import { SLICE_MACHINE_NPM_PACKAGE_NAME } from "./constants";
import { safelyExecute } from "./lib/safelyExecute";

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
	open: boolean;

	/**
	 * The port on which to start the Slice Machine server.
	 *
	 * @defaultValue `9999`
	 */
	port: number;

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
		// This migration needs to run before the plugins are initialised
		// Nothing can start without the config file
		await migrateSMJSON(this._sliceMachineManager);

		// Initialize Segment and Sentry
		const appVersion =
			await this._sliceMachineManager.versions.getRunningSliceMachineVersion();
		await this._sliceMachineManager.telemetry.initTelemetry({
			appName: SLICE_MACHINE_NPM_PACKAGE_NAME,
			appVersion,
		});
		const isTelemetryEnabled =
			await this._sliceMachineManager.telemetry.checkIsTelemetryEnabled();
		if (isTelemetryEnabled) {
			try {
				await setupSentry(this._sliceMachineManager);
			} catch (error) {
				// noop - We don't want to stop the user from using Slice Machine
				// because of failed tracking set up. We probably couldn't determine the
				// Sentry environment.

				if (import.meta.env.DEV) {
					console.error("Error setting up Sentry:", error);
				}
			}
		}

		await this._sliceMachineManager.plugins.initPlugins();

		// TODO: MIGRATION - Move this to the Migration Manager
		await migrateAssets(this._sliceMachineManager);

		await this._validateProject();

		if (isTelemetryEnabled) {
			try {
				this._trackStart();
			} catch (error) {
				// noop - We don't want to stop the user from using Slice Machine
				// because of failed start event tracking.

				if (import.meta.env.DEV) {
					console.error("Error tracking start event:", error);
				}
			}
		}

		const app = await createSliceMachineExpressApp({
			sliceMachineManager: this._sliceMachineManager,
		});
		const server = app.listen(this.port);
		const address = server.address() as AddressInfo;
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
		console.log();

		const profile = await this._fetchProfile();

		if (profile) {
			this._sliceMachineManager.telemetry.identify({
				userID: profile.shortId,
				intercomHash: profile.intercomHash,
			});

			await Promise.allSettled([
				// noop - We'll try again when needed.
				this._sliceMachineManager.user.refreshAuthenticationToken(),
				// noop - We'll try again before uploading a screenshot.
				this._sliceMachineManager.screenshots.initS3ACL(),
			]);
		}
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
			await this._sliceMachineManager.versions.getRunningSliceMachineVersion();

		return `${chalk.bgBlack(
			` ${chalk.bold.white("Slice Machine")} ${chalk.magenta(
				`v${currentVersion}`,
			)} `,
		)} ${chalk.dim("→")} ${value}`;
	}

	/**
	 * Validates the project's config and content models.
	 *
	 * @throws Throws if a Library name is invalid.
	 * @throws Throws if a Slice model is invalid.
	 * @throws Throws if a Custom Type model is invalid.
	 */
	private async _validateProject(): Promise<void> {
		// Validate Slice Machine config.
		const config =
			await this._sliceMachineManager.project.loadSliceMachineConfig();

		// Validate Library IDs
		const invalidLibraries =
			config.libraries?.filter(
				(library) => library.startsWith("@") || library.startsWith("~"),
			) || [];
		if (invalidLibraries.length > 0) {
			throw new Error(
				`The following Slice libraries have invalid names: ${invalidLibraries.join(
					", ",
				)}. Slice library names must not start with "@" nor "~".`,
			);
		}

		// Validate Slice models.
		const allSlices = await this._sliceMachineManager.slices.readAllSlices();
		if (allSlices.errors.length > 0) {
			throw new Error(
				`Errors occurred while validating your project's slices.\n\n${allSlices.errors.join(
					"\n\n",
				)}`,
			);
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

	/**
	 * Tracks the start of Slice Machine.
	 *
	 * This method is called after Slice Machine has started and so it will not
	 * cause the process to wait for the tracking to complete.
	 */
	private async _trackStart(): Promise<void> {
		const [
			adapter,
			adapterVersion,
			customTypes,
			gitProvider,
			isAdapterUpdateAvailable,
			isLoggedIn,
			isSliceMachineUpdateAvailable,
			isTypeScriptProject,
			packageManager,
			simulatorUrl,
			sliceMachineVersion,
			slices,
			versionControlSystem,
		] = await Promise.all([
			safelyExecute(() => this._sliceMachineManager.project.getAdapterName()),
			safelyExecute(() =>
				this._sliceMachineManager.versions.getRunningAdapterVersion(),
			),
			safelyExecute(() =>
				this._sliceMachineManager.customTypes.readAllCustomTypes(),
			),
			safelyExecute(() => this._sliceMachineManager.git.detectGitProvider()),
			safelyExecute(() =>
				this._sliceMachineManager.versions.checkIsAdapterUpdateAvailable(),
			),
			safelyExecute(() => this._sliceMachineManager.user.checkIsLoggedIn()),
			safelyExecute(() =>
				this._sliceMachineManager.versions.checkIsSliceMachineUpdateAvailable(),
			),
			safelyExecute(() =>
				this._sliceMachineManager.project.checkIsTypeScript(),
			),
			safelyExecute(() =>
				this._sliceMachineManager.project.detectPackageManager(),
			),
			safelyExecute(() =>
				this._sliceMachineManager.simulator.getLocalSliceSimulatorURL(),
			),
			safelyExecute(() =>
				this._sliceMachineManager.versions.getRunningSliceMachineVersion(),
			),
			safelyExecute(() => this._sliceMachineManager.slices.readAllSlices()),
			safelyExecute(() =>
				this._sliceMachineManager.project.detectVersionControlSystem(),
			),
		]);

		this._sliceMachineManager.telemetry.track({
			event: "slice-machine:start",
			_includeEnvironmentKind: true,
			adapter,
			adapterVersion,
			gitProvider,
			isAdapterUpdateAvailable,
			isLoggedIn,
			isSliceMachineUpdateAvailable,
			isTypeScriptProject,
			nodeVersion: process.versions.node,
			numberOfCustomTypes: customTypes?.models.length,
			numberOfSlices: slices?.models.length,
			osPlatform: os.platform(),
			// Ensure we escape the "@" character to prevent it from being interpreted
			// as an email address and being considered sensitive and stripped off.
			packageManager: packageManager?.replace("@", "[at]"),
			projectPort: simulatorUrl ? new URL(simulatorUrl).port : undefined,
			sliceMachineVersion,
			versionControlSystem,
		});
	}
}

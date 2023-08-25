import { randomUUID } from "node:crypto";

import SegmentClient from "analytics-node";

import { readPrismicrc } from "../../lib/prismicrc";

import { API_TOKENS } from "../../constants/API_TOKENS";

import { BaseManager } from "../BaseManager";

import {
	HumanSegmentEventType,
	HumanSegmentEventTypes,
	SegmentEvents,
} from "./types";

type TelemetryManagerInitTelemetryArgs = {
	appName: string;
	appVersion: string;
};

type TelemetryManagerTrackArgs = SegmentEvents;

type TelemetryManagerIdentifyArgs = {
	userID: string;
	intercomHash: string;
};

type TelemetryManagerGroupArgs = {
	manualLibsCount: number;
	downloadedLibsCount: number;
	npmLibsCount: number;
	downloadedLibs: string[];
};

type TelemetryManagerContext = {
	app: {
		name: string;
		version: string;
	};
};

function assertTelemetryInitialized(
	segmentClient: SegmentClient | undefined,
): asserts segmentClient is NonNullable<typeof segmentClient> {
	if (segmentClient == undefined) {
		throw new Error(
			"Telemetry has not been initialized. Run `SliceMachineManager.telemetry.prototype.initTelemetry()` before re-calling this method.",
		);
	}
}

export class TelemetryManager extends BaseManager {
	private _segmentClient: SegmentClient | undefined = undefined;
	private _anonymousID: string | undefined = undefined;
	private _userID: string | undefined = undefined;
	private _context: TelemetryManagerContext | undefined = undefined;

	async initTelemetry(args: TelemetryManagerInitTelemetryArgs): Promise<void> {
		if (this._segmentClient) {
			// Prevent subsequent initializations.
			return;
		}

		this._segmentClient = new SegmentClient(API_TOKENS.SegmentKey, {
			// Since it's a local app, we do not benefit from event batching the way a server would normally do, all tracking event will be awaited.
			flushAt: 1,
			// TODO: Verify that this actually does not send data to Segment when false.
			enable: await this.checkIsTelemetryEnabled(),
			errorHandler: () => {
				// noop - We don't care if the tracking event
				// failed. Some users or networks intentionally
				// block Segment, so we can't block the app if
				// a tracking event is unsuccessful.
			},
		});
		this._anonymousID = randomUUID();
		this._context = { app: { name: args.appName, version: args.appVersion } };
	}

	// TODO: Should `userId` be automatically populated by the logged in
	// user? We already have their info via UserRepository.
	async track(args: TelemetryManagerTrackArgs): Promise<void> {
		const { event, repository, ...properties } = args;
		let repositoryName = repository;

		if (repositoryName === undefined) {
			try {
				repositoryName = await this.project.getRepositoryName();
			} catch (error) {
				// noop, happen only when the user is not in a project
			}
		}

		const payload: {
			event: HumanSegmentEventTypes;
			userId?: string;
			anonymousId?: string;
			properties?: Record<string, unknown>;
			context?: Partial<TelemetryManagerContext> & {
				groupId?: {
					Repository?: string;
				};
			};
		} = {
			event: HumanSegmentEventType[event],
			properties: {
				nodeVersion: process.versions.node,
				...properties,
			},
			context: { ...this._context },
		};

		if (this._userID) {
			payload.userId = this._userID;
		} else {
			payload.anonymousId = this._anonymousID;
		}

		if (repositoryName) {
			payload.context ||= {};
			payload.context.groupId ||= {};
			payload.context.groupId.Repository = repositoryName;
		}

		return new Promise((resolve) => {
			assertTelemetryInitialized(this._segmentClient);

			// TODO: Make sure client fails gracefully when no internet connection
			this._segmentClient.track(
				payload as Parameters<typeof this._segmentClient.track>[0],
				(maybeError?: Error) => {
					if (maybeError && import.meta.env.DEV) {
						// TODO: Not sure how we want to deal with that
						console.warn(
							`An error occurred during Segment tracking`,
							maybeError,
						);
					}

					resolve();
				},
			);
		});
	}

	// TODO: Should `userID` and `intercomHash` be automatically populated
	// by the logged in user? We already have their info via
	// UserRepository.
	identify(args: TelemetryManagerIdentifyArgs): Promise<void> {
		const payload = {
			userId: args.userID,
			anonymousId: this._anonymousID,
			integrations: {
				Intercom: {
					user_hash: args.intercomHash,
				},
			},
			context: { ...this._context },
		};

		this._userID = args.userID;

		return new Promise((resolve) => {
			assertTelemetryInitialized(this._segmentClient);

			// TODO: Make sure client fails gracefully when no internet connection
			this._segmentClient.identify(payload, (maybeError?: Error) => {
				if (maybeError && import.meta.env.DEV) {
					// TODO: Not sure how we want to deal with that
					console.warn(`An error occurred during Segment identify`, maybeError);
				}

				resolve();
			});
		});
	}

	async group(args: TelemetryManagerGroupArgs): Promise<void> {
		let repositoryName;

		try {
			repositoryName = await this.project.getRepositoryName();
		} catch (error) {
			// noop, happen only when the user is not in a project
		}

		const payload: {
			groupId?: string;
			userId?: string;
			anonymousId?: string;
			traits?: Record<string, unknown>;
			context?: Partial<TelemetryManagerContext> & {
				groupId?: {
					Repository?: string;
				};
			};
		} = {
			traits: args,
			context: { ...this._context },
		};

		if (this._userID) {
			payload.userId = this._userID;
		} else {
			payload.anonymousId = this._anonymousID;
		}

		if (repositoryName) {
			payload.groupId = repositoryName;
			payload.context ||= {};
			payload.context.groupId ||= {};
			payload.context.groupId.Repository = repositoryName;
		}

		return new Promise((resolve) => {
			assertTelemetryInitialized(this._segmentClient);

			this._segmentClient.group(
				payload as Parameters<typeof this._segmentClient.group>[0],
				(maybeError?: Error) => {
					if (maybeError && import.meta.env.DEV) {
						// TODO: Not sure how we want to deal with that
						console.warn(`An error occurred during Segment group`, maybeError);
					}

					resolve();
				},
			);
		});
	}

	async checkIsTelemetryEnabled(): Promise<boolean> {
		let root: string;
		try {
			root = await this.project.getRoot();
		} catch {
			root = await this.project.suggestRoot();
		}

		return readPrismicrc(root).telemetry !== false;
	}
}

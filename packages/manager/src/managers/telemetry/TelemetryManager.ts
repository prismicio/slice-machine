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

type TelemetryManagerTrackArgs = SegmentEvents;

type TelemetryManagerIdentifyArgs = {
	userID: string;
	intercomHash: string;
};

function assertTelemetryInitialized(
	segmentClient: SegmentClient | undefined,
): asserts segmentClient is NonNullable<typeof segmentClient> {
	if (segmentClient == undefined) {
		throw new Error(
			"Telemetry have not yet been initialized. Run `SliceMachineManager.telemetry.prototype.initTelemetry()` before re-calling this method.",
		);
	}
}

export class TelemetryManager extends BaseManager {
	private _enabled = false;
	private _segmentClient: SegmentClient | undefined = undefined;
	private _anonymousID = "";
	private _userID: string | undefined = undefined;

	async initTelemetry(): Promise<void> {
		try {
			assertTelemetryInitialized(this._segmentClient);

			// Prevent further initialization
			return;
		} catch {}

		let root: string;
		try {
			root = await this.project.getRoot();
		} catch {
			root = await this.project.suggestRoot();
		}

		this._enabled = readPrismicrc(root).telemetry !== false;
		this._segmentClient = new SegmentClient(API_TOKENS.SegmentKey, {
			// Since it's a local app, we do not benefit from event batching the way a server would normally do, all tracking event will be awaited.
			flushAt: 1,
			// TODO: Verify that this actually does not send data to Segment when false.
			enable: this._enabled,
		});
		this._anonymousID = randomUUID();
	}

	track(args: TelemetryManagerTrackArgs): Promise<void> {
		return new Promise((resolve) => {
			assertTelemetryInitialized(this._segmentClient);

			const { event, repository, ...properties } = args;

			const payload: {
				event: HumanSegmentEventTypes;
				userId?: string;
				anonymousId?: string;
				properties?: Record<string, unknown>;
				context?: {
					groupId?: {
						Repository?: string;
					};
				};
			} = {
				event: HumanSegmentEventType[event],
				properties: {
					repo: repository,
					...properties,
				},
			};

			if (this._userID) {
				payload.userId = this._userID;
			} else {
				payload.anonymousId = this._anonymousID;
			}

			if (args.repository) {
				payload.context ||= {};
				payload.context.groupId ||= {};
				payload.context.groupId.Repository = repository;
			}

			// TODO: Make sure client fails gracefully when no internet connection
			this._segmentClient.track(payload, (maybeError?: Error) => {
				if (maybeError) {
					// TODO: Not sure how we want to deal with that
					console.warn(`An error happened during Segment tracking`, maybeError);
				}

				resolve();
			});
		});
	}

	identify(args: TelemetryManagerIdentifyArgs): Promise<void> {
		return new Promise((resolve) => {
			assertTelemetryInitialized(this._segmentClient);

			const payload = {
				userId: args.userID,
				anonymousId: this._anonymousID,
				integrations: {
					Intercom: {
						user_hash: args.intercomHash,
					},
				},
			};
			this._userID = args.userID;

			// TODO: Make sure client fails gracefully when no internet connection
			this._segmentClient.identify(payload, (maybeError?: Error) => {
				if (maybeError) {
					// TODO: Not sure how we want to deal with that
					console.warn(`An error happened during Segment identify`, maybeError);
				}

				resolve();
			});
		});
	}
}

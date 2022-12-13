import { randomUUID } from "node:crypto";

import SegmentClient from "analytics-node";

import { APITokens, readPrismicrc } from "@slicemachine/misc";

import {
	HumanSegmentEventType,
	HumanSegmentEventTypes,
	SegmentEvents,
} from "./types";

type PrismicTelemetryTrackArgs = SegmentEvents;

type PrismicTelemetryIdentifyArgs = {
	userID: string;
	intercomHash: string;
};

export class PrismicTelemetry {
	private _enabled: boolean;
	private _segmentClient: SegmentClient;
	private _anonymousID: string;
	private _userID: string | null;

	constructor() {
		this._enabled = readPrismicrc().telemetry !== false;

		this._segmentClient = new SegmentClient(APITokens.SegmentKey, {
			// Since it's a local app, we do not benefit from event batching the way a server would normally do, all tracking event will be awaited.
			flushAt: 1,
			// TODO: Verify that this actually does not send data to Segment when false.
			enable: this._enabled,
		});

		this._anonymousID = randomUUID();

		this._userID = null;
	}

	track(args: PrismicTelemetryTrackArgs): Promise<void> {
		return new Promise((resolve) => {
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

	identify(args: PrismicTelemetryIdentifyArgs): Promise<void> {
		return new Promise((resolve) => {
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

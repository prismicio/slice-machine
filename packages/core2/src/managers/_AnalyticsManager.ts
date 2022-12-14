import { randomUUID } from "node:crypto";

import SegmentClient from "analytics-node";

import { BaseManager } from "./_BaseManager";
import { Analytics } from "../constants";
import { readPrismicrc } from "../lib/prismicrc";

const SegmentEventType = {
	command_init_start: "command:init:start",
	command_init_identify: "command:init:identify",
	command_init_end: "command:init:end",
} as const;
type SegmentEventTypes = typeof SegmentEventType[keyof typeof SegmentEventType];

const RealSegmentEventType = {
	[SegmentEventType.command_init_start]: "SliceMachine Init Start",
	[SegmentEventType.command_init_identify]: "SliceMachine Init Identify",
	[SegmentEventType.command_init_end]: "SliceMachine Init End",
} as const;
type RealSegmentEventTypes =
	typeof RealSegmentEventType[keyof typeof RealSegmentEventType];

type SegmentEvent<
	TType extends SegmentEventTypes,
	TProperties extends Record<string, unknown> | void = void,
> = TProperties extends void
	? {
			event: TType;
			repository?: string;
	  }
	: {
			event: TType;
			repository?: string;
	  } & TProperties;

type CommandInitStartSegmentEvent = SegmentEvent<
	typeof SegmentEventType.command_init_start
>;

// This event feels off, we have a dedicated `identify` method...
type CommandInitIdentifySegmentEvent = SegmentEvent<
	typeof SegmentEventType.command_init_identify
>;

type CommandInitEndSegmentEvent = SegmentEvent<
	typeof SegmentEventType.command_init_end,
	{ framework: string; success: boolean; error?: string }
>;

type SegmentEvents =
	| CommandInitStartSegmentEvent
	| CommandInitIdentifySegmentEvent
	| CommandInitEndSegmentEvent;

type SliceMachineManagerAnalyticsTrackArgs = SegmentEvents;

type SliceMachineManagerAnalyticsIdentifyArgs = {
	userID: string;
	intercomHash: string;
};

function assertAnalyticsInitialized(
	segmentClient: SegmentClient | undefined,
): asserts segmentClient is NonNullable<typeof segmentClient> {
	if (segmentClient == undefined) {
		throw new Error(
			"Analytics have not yet been initialized. Run `SliceMachineManager.analytics.prototype.initAnalytics()` before re-calling this method.",
		);
	}
}

export class AnalyticsManager extends BaseManager {
	private _enabled = false;
	private _segmentClient: SegmentClient | undefined = undefined;
	private _anonymousID = "";
	private _userID: string | undefined = undefined;

	async initAnalytics(): Promise<void> {
		try {
			assertAnalyticsInitialized(this._segmentClient);

			// Prevent further initialization
			return;
		} catch {}

		this._enabled = readPrismicrc().telemetry !== false;
		this._segmentClient = new SegmentClient(Analytics.SegmentKey, {
			// Since it's a local app, we do not benefit from event batching the way a server would normally do, all tracking event will be awaited.
			flushAt: 1,
			// TODO: Verify that this actually does not send data to Segment when false.
			enable: this._enabled,
		});
		this._anonymousID = randomUUID();
	}

	track(args: SliceMachineManagerAnalyticsTrackArgs): Promise<void> {
		return new Promise((resolve) => {
			assertAnalyticsInitialized(this._segmentClient);

			const { event, repository, ...properties } = args;

			const payload: {
				event: RealSegmentEventTypes;
				userId?: string;
				anonymousId?: string;
				properties?: Record<string, unknown>;
				context?: {
					groupId?: {
						Repository?: string;
					};
				};
			} = {
				event: RealSegmentEventType[event],
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

	identify(args: SliceMachineManagerAnalyticsIdentifyArgs): Promise<void> {
		return new Promise((resolve) => {
			assertAnalyticsInitialized(this._segmentClient);

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

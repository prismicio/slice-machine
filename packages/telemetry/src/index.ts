export { createPrismicTelemetry } from "./createPrismicTelemetry";
export type { PrismicTelemetry } from "./PrismicTelemetry";

export { SegmentEventType } from "./types";
export type {
	// All possible event types
	SegmentEventTypes,

	// Individual events
	CommandInitStartSegmentEvent,
	CommandInitIdentifySegmentEvent,
	CommandInitEndSegmentEvent,

	// All possible events
	SegmentEvents,
} from "./types";

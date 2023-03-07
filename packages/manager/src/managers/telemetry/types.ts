export const SegmentEventType = {
	command_init_start: "command:init:start",
	command_init_identify: "command:init:identify",
	command_init_end: "command:init:end",
	customType_created: "custom-type:created",
	customType_saved: "custom-type:saved",
} as const;
type SegmentEventTypes = typeof SegmentEventType[keyof typeof SegmentEventType];

export const HumanSegmentEventType = {
	[SegmentEventType.command_init_start]: "SliceMachine Init Start",
	[SegmentEventType.command_init_identify]: "SliceMachine Init Identify",
	[SegmentEventType.command_init_end]: "SliceMachine Init End",
	[SegmentEventType.customType_created]: "SliceMachine Custom Type Created",
	[SegmentEventType.customType_saved]: "SliceMachine Custom Type Saved",
} as const;
export type HumanSegmentEventTypes =
	typeof HumanSegmentEventType[keyof typeof HumanSegmentEventType];

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

type CustomTypeCreatedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_created,
	{ id: string; name: string; type: "repeatable" | "single" }
>;

type CustomTypeSavedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_saved,
	{ id: string; name: string; type: "repeatable" | "single" }
>;

export type SegmentEvents =
	| CommandInitStartSegmentEvent
	| CommandInitIdentifySegmentEvent
	| CommandInitEndSegmentEvent
	| CustomTypeCreatedSegmentEvent
	| CustomTypeSavedSegmentEvent;

export const SegmentEventType = {
	command_init_start: "command:init:start",
	command_init_identify: "command:init:identify",
	command_init_end: "command:init:end",
} as const;
export type SegmentEventTypes =
	typeof SegmentEventType[keyof typeof SegmentEventType];

export const HumanSegmentEventType = {
	[SegmentEventType.command_init_start]: "SliceMachine Init Start",
	[SegmentEventType.command_init_identify]: "SliceMachine Init Identify",
	[SegmentEventType.command_init_end]: "SliceMachine Init End",
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

export type CommandInitStartSegmentEvent = SegmentEvent<
	typeof SegmentEventType.command_init_start
>;

// This event feels off, we have a dedicated `identify` method...
export type CommandInitIdentifySegmentEvent = SegmentEvent<
	typeof SegmentEventType.command_init_identify
>;

export type CommandInitEndSegmentEvent = SegmentEvent<
	typeof SegmentEventType.command_init_end,
	{ framework: string; success: boolean; error?: string }
>;

export type SegmentEvents =
	| CommandInitStartSegmentEvent
	| CommandInitIdentifySegmentEvent
	| CommandInitEndSegmentEvent;

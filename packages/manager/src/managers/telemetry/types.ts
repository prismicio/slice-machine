export const SegmentEventType = {
	command_init_start: "command:init:start",
	command_init_identify: "command:init:identify",
	command_init_end: "command:init:end",
	review: "review",
	onboarding_start: "onboarding:start",
	onboarding_skip: "onboarding:skip",
	customType_created: "custom-type:created",
	customType_fieldAdded: "custom-type:field-added",
	customType_sliceZoneUpdated: "custom-type:slice-zone-updated",
	customType_saved: "custom-type:saved",
} as const;
type SegmentEventTypes = typeof SegmentEventType[keyof typeof SegmentEventType];

export const HumanSegmentEventType = {
	[SegmentEventType.command_init_start]: "SliceMachine Init Start",
	[SegmentEventType.command_init_identify]: "SliceMachine Init Identify",
	[SegmentEventType.command_init_end]: "SliceMachine Init End",
	[SegmentEventType.review]: "SliceMachine Review",
	[SegmentEventType.onboarding_start]: "SliceMachine Onboarding Start",
	[SegmentEventType.onboarding_skip]: "SliceMachine Onboarding Skip",
	[SegmentEventType.customType_created]: "SliceMachine Custom Type Created",
	[SegmentEventType.customType_fieldAdded]:
		"SliceMachine Custom Type Field Added",
	[SegmentEventType.customType_sliceZoneUpdated]:
		"SliceMachine Slicezone Updated",
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

type ReviewSegmentEvent = SegmentEvent<
	typeof SegmentEventType.review,
	{ framework: string; rating: number; comment: string }
>;

type OnboardingStartSegmentEvent = SegmentEvent<
	typeof SegmentEventType.onboarding_start
>;

type OnboardingSkipSegmentEvent = SegmentEvent<
	typeof SegmentEventType.onboarding_skip,
	{ screenSkipped: number }
>;

type CustomTypeCreatedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_created,
	{ id: string; name: string; type: "repeatable" | "single" }
>;

type CustomTypeFieldAddedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_fieldAdded,
	{
		id: string; // field id
		name: string; // custom type id
		zone: "static" | "repeatable";
		type: string;
	}
>;

type CustomTypeSliceZoneUpdatedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_sliceZoneUpdated,
	{ customTypeId: string }
>;

type CustomTypeSavedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_saved,
	{ id: string; name: string; type: "repeatable" | "single" }
>;

export type SegmentEvents =
	| CommandInitStartSegmentEvent
	| CommandInitIdentifySegmentEvent
	| CommandInitEndSegmentEvent
	| ReviewSegmentEvent
	| OnboardingStartSegmentEvent
	| OnboardingSkipSegmentEvent
	| CustomTypeCreatedSegmentEvent
	| CustomTypeFieldAddedSegmentEvent
	| CustomTypeSliceZoneUpdatedSegmentEvent
	| CustomTypeSavedSegmentEvent;

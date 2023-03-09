export const SegmentEventType = {
	command_init_start: "command:init:start",
	command_init_identify: "command:init:identify",
	command_init_end: "command:init:end",
	review: "review",
	onboarding_start: "onboarding:start",
	onboarding_skip: "onboarding:skip",
	onboarding_continue_screenIntro: "onboarding:continue:screen-intro",
	onboarding_continue_screen1: "onboarding:continue:screen-1",
	onboarding_continue_screen2: "onboarding:continue:screen-2",
	onboarding_continue_screen3: "onboarding:continue:screen-3",
	sliceSimulator_setup: "slice-simulator:setup",
	sliceSimulator_open: "slice-simulator:open",
	sliceSimulator_isNotRunning: "slice-simulator:is-not-running",
	pageView: "page-view",
	openVideoTutorials: "open-video-tutorials",
	customType_created: "custom-type:created",
	customType_fieldAdded: "custom-type:field-added",
	customType_sliceZoneUpdated: "custom-type:slice-zone-updated",
	customType_saved: "custom-type:saved",
	slice_created: "slice:created",
} as const;
type SegmentEventTypes = typeof SegmentEventType[keyof typeof SegmentEventType];

export const HumanSegmentEventType = {
	[SegmentEventType.command_init_start]: "SliceMachine Init Start",
	[SegmentEventType.command_init_identify]: "SliceMachine Init Identify",
	[SegmentEventType.command_init_end]: "SliceMachine Init End",
	[SegmentEventType.review]: "SliceMachine Review",
	[SegmentEventType.onboarding_start]: "SliceMachine Onboarding Start",
	[SegmentEventType.onboarding_skip]: "SliceMachine Onboarding Skip",
	[SegmentEventType.onboarding_continue_screenIntro]:
		"SliceMachine Onboarding Continue Screen Intro",
	[SegmentEventType.onboarding_continue_screen1]:
		"SliceMachine Onboarding Continue Screen 1",
	[SegmentEventType.onboarding_continue_screen2]:
		"SliceMachine Onboarding Continue Screen 2",
	[SegmentEventType.onboarding_continue_screen3]:
		"SliceMachine Onboarding Continue Screen 3",
	[SegmentEventType.sliceSimulator_setup]: "SliceMachine Slice Simulator Setup",
	[SegmentEventType.sliceSimulator_open]: "SliceMachine Slice Simulator Open",
	[SegmentEventType.sliceSimulator_isNotRunning]:
		"SliceMachine Slice Simulator is not running",
	[SegmentEventType.pageView]: "SliceMachine Page View",
	[SegmentEventType.openVideoTutorials]: "SliceMachine Open Video Tutorials",
	[SegmentEventType.customType_created]: "SliceMachine Custom Type Created",
	[SegmentEventType.customType_fieldAdded]:
		"SliceMachine Custom Type Field Added",
	[SegmentEventType.customType_sliceZoneUpdated]:
		"SliceMachine Slicezone Updated",
	[SegmentEventType.customType_saved]: "SliceMachine Custom Type Saved",
	[SegmentEventType.slice_created]: "SliceMachine Slice Created",
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

type OnboardingContinueScreenIntroSegmentEvent = SegmentEvent<
	typeof SegmentEventType.onboarding_continue_screenIntro
>;

type OnboardingContinueScreen1SegmentEvent = SegmentEvent<
	typeof SegmentEventType.onboarding_continue_screen1
>;

type OnboardingContinueScreen2SegmentEvent = SegmentEvent<
	typeof SegmentEventType.onboarding_continue_screen2
>;

type OnboardingContinueScreen3SegmentEvent = SegmentEvent<
	typeof SegmentEventType.onboarding_continue_screen3
>;

type SliceSimulatorSetupSegmentEvent = SegmentEvent<
	typeof SegmentEventType.sliceSimulator_setup,
	{ framework: string; version: string }
>;

type SliceSimulatorOpenSegmentEvent = SegmentEvent<
	typeof SegmentEventType.sliceSimulator_open,
	{ framework: string; version: string }
>;

type SliceSimulatorIsNotRunningSegmentEvent = SegmentEvent<
	typeof SegmentEventType.sliceSimulator_isNotRunning,
	{ framework: string }
>;

type PageViewSegmentEvent = SegmentEvent<
	typeof SegmentEventType.pageView,
	{
		url: string;
		path: string;
		search: string;
		title: string;
		referrer: string;
		framework: string;
		slicemachineVersion: string;
	}
>;

type OpenVideoTutorialsSegmentEvent = SegmentEvent<
	typeof SegmentEventType.openVideoTutorials,
	{ framework: string; slicemachineVersion: string; video: string }
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

type SliceCreatedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.slice_created,
	{ id: string; name: string; library: string }
>;

export type SegmentEvents =
	| CommandInitStartSegmentEvent
	| CommandInitIdentifySegmentEvent
	| CommandInitEndSegmentEvent
	| ReviewSegmentEvent
	| OnboardingStartSegmentEvent
	| OnboardingSkipSegmentEvent
	| OnboardingContinueScreenIntroSegmentEvent
	| OnboardingContinueScreen1SegmentEvent
	| OnboardingContinueScreen2SegmentEvent
	| OnboardingContinueScreen3SegmentEvent
	| SliceSimulatorSetupSegmentEvent
	| SliceSimulatorOpenSegmentEvent
	| SliceSimulatorIsNotRunningSegmentEvent
	| PageViewSegmentEvent
	| OpenVideoTutorialsSegmentEvent
	| CustomTypeCreatedSegmentEvent
	| CustomTypeFieldAddedSegmentEvent
	| CustomTypeSliceZoneUpdatedSegmentEvent
	| CustomTypeSavedSegmentEvent
	| SliceCreatedSegmentEvent;

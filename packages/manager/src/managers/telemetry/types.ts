import { CustomTypeFormat } from "../customTypes/types";
import type { LimitType } from "../prismicRepository/types";

export const SegmentEventType = {
	command_init_start: "command:init:start",
	command_init_identify: "command:init:identify",
	command_init_end: "command:init:end",
	review: "review",
	sliceSimulator_setup: "slice-simulator:setup",
	sliceSimulator_open: "slice-simulator:open",
	sliceSimulator_isNotRunning: "slice-simulator:is-not-running",
	pageView: "page-view",
	users_invite_button_clicked: "users-invite-button-clicked",
	openVideoTutorials: "open-video-tutorials",
	customType_created: "custom-type:created",
	customType_fieldAdded: "custom-type:field-added",
	customType_sliceZoneUpdated: "custom-type:slice-zone-updated",
	customType_openAddFromTemplates: "custom-type:open-add-from-templates",
	customType_saved: "custom-type:saved",
	slice_created: "slice:created",
	legacySlice_converted: "legacy-slice:converted",
	screenshotTaken: "screenshot-taken",
	changes_pushed: "changes:pushed",
	changes_limitReach: "changes:limit-reach",
	editor_widgetUsed: "editor:widget-used",
	open_page_snippet: "page-type:open-snippet",
	copy_page_snippet: "page-type:copy-snippet",
	switch_environment: "environment:switch",
} as const;
type SegmentEventTypes =
	(typeof SegmentEventType)[keyof typeof SegmentEventType];

export const HumanSegmentEventType = {
	[SegmentEventType.command_init_start]: "SliceMachine Init Start",
	[SegmentEventType.command_init_identify]: "SliceMachine Init Identify",
	[SegmentEventType.command_init_end]: "SliceMachine Init End",
	[SegmentEventType.review]: "SliceMachine Review",
	[SegmentEventType.sliceSimulator_setup]: "SliceMachine Slice Simulator Setup",
	[SegmentEventType.sliceSimulator_open]: "SliceMachine Slice Simulator Open",
	[SegmentEventType.sliceSimulator_isNotRunning]:
		"SliceMachine Slice Simulator is not running",
	[SegmentEventType.pageView]: "SliceMachine Page View",
	[SegmentEventType.users_invite_button_clicked]:
		"Slice Machine Users Invite Button Clicked",
	[SegmentEventType.openVideoTutorials]: "SliceMachine Open Video Tutorials",
	[SegmentEventType.customType_created]: "SliceMachine Custom Type Created",
	[SegmentEventType.customType_fieldAdded]:
		"SliceMachine Custom Type Field Added",
	[SegmentEventType.customType_sliceZoneUpdated]:
		"SliceMachine Slicezone Updated",
	[SegmentEventType.customType_openAddFromTemplates]:
		"SliceMachine Open Add from templates",
	[SegmentEventType.customType_saved]: "SliceMachine Custom Type Saved",
	[SegmentEventType.slice_created]: "SliceMachine Slice Created",
	[SegmentEventType.legacySlice_converted]:
		"SliceMachine Legacy Slice Converted",
	[SegmentEventType.screenshotTaken]: "SliceMachine Screenshot Taken",
	[SegmentEventType.changes_pushed]: "SliceMachine Changes Pushed",
	[SegmentEventType.changes_limitReach]: "SliceMachine Changes Limit Reach",
	[SegmentEventType.editor_widgetUsed]: "SliceMachine Editor Widget Used",
	[SegmentEventType.open_page_snippet]:
		"SliceMachine Opens Page Type Snippet Dialog",
	[SegmentEventType.copy_page_snippet]:
		"Slice Machine page code snippet copied",
	[SegmentEventType.switch_environment]: "SliceMachine environment switch",
} as const;
export type HumanSegmentEventTypes =
	(typeof HumanSegmentEventType)[keyof typeof HumanSegmentEventType];

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
	{
		rating: number;
		comment: string;
		type: "onboarding" | "advanced repository";
	}
>;

type SliceSimulatorSetupSegmentEvent = SegmentEvent<
	typeof SegmentEventType.sliceSimulator_setup
>;

type SliceSimulatorOpenSegmentEvent = SegmentEvent<
	typeof SegmentEventType.sliceSimulator_open
>;

type SliceSimulatorIsNotRunningSegmentEvent = SegmentEvent<
	typeof SegmentEventType.sliceSimulator_isNotRunning
>;

type PageViewSegmentEvent = SegmentEvent<
	typeof SegmentEventType.pageView,
	{
		url: string;
		path: string;
		search: string;
		title: string;
		referrer: string;
		adapter: string;
		/*
		 * We are tracking outer sizes instead of inner sizes as with the latter, we
		 * can't differentiate between users with a high-density screen and those
		 * zooming in/out with ⌘ + / ⌘ -. Indeed, when users zoom in/out, some
		 * browsers (like Google Chrome) will update `window.devicePixelRatio` while
		 * others (like Safari) will keep it unchanged so that it always reflects
		 * the ratio of physical pixels to CSS pixels.
		 */
		outerWidth: number;
		outerHeight: number;
		screenWidth: number;
		screenHeight: number;
	}
>;

type OpenPageSnippetSegmentEvent = SegmentEvent<
	typeof SegmentEventType.open_page_snippet,
	{ framework: string }
>;

type CopyPageSnippetSegmentEvent = SegmentEvent<
	typeof SegmentEventType.copy_page_snippet,
	{ framework: string }
>;

type SwitchEnvironmentSegmentEvent = SegmentEvent<
	typeof SegmentEventType.switch_environment,
	{ domain: string }
>;

type UsersInviteButtonClickedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.users_invite_button_clicked
>;

type OpenVideoTutorialsSegmentEvent = SegmentEvent<
	typeof SegmentEventType.openVideoTutorials,
	{ video: string }
>;

type CustomTypeCreatedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_created,
	{
		id: string;
		name: string;
		format: CustomTypeFormat;
		type: "repeatable" | "single";
		origin: "onboarding" | "table";
	}
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

type CustomTypeOpenAddFromTemplatesEvent = SegmentEvent<
	typeof SegmentEventType.customType_openAddFromTemplates,
	{ customTypeId: string; customTypeFormat: CustomTypeFormat }
>;

type CustomTypeSavedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.customType_saved,
	{
		id: string;
		name: string;
		format: CustomTypeFormat;
		type: "repeatable" | "single";
	}
>;

type SliceCreatedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.slice_created,
	{ id: string; name: string; library: string; sliceTemplate?: string }
>;

type LegacySliceConvertedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.legacySlice_converted,
	{
		id: string;
		variation: string;
		library: string;
		conversionType:
			| "as_new_slice"
			| "as_new_variation"
			| "merge_with_identical";
	}
>;

type ScreenshotTakenSegmentEvent = SegmentEvent<
	typeof SegmentEventType.screenshotTaken,
	{
		type: "custom";
		method: "upload" | "dragAndDrop";
	}
>;

type ChangesPushedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.changes_pushed,
	{
		customTypesCreated: number;
		customTypesModified: number;
		customTypesDeleted: number;
		slicesCreated: number;
		slicesModified: number;
		slicesDeleted: number;
		missingScreenshots: number;
		total: number;
		duration: number;
		hasDeletedDocuments: boolean;
	}
>;

type ChangesLimitReachSegmentEvent = SegmentEvent<
	typeof SegmentEventType.changes_limitReach,
	{ limitType: LimitType }
>;

type EditorWidgetUsedSegmentEvent = SegmentEvent<
	typeof SegmentEventType.editor_widgetUsed,
	{ sliceId: string }
>;

export type SegmentEvents =
	| CommandInitStartSegmentEvent
	| CommandInitIdentifySegmentEvent
	| CommandInitEndSegmentEvent
	| ReviewSegmentEvent
	| SliceSimulatorSetupSegmentEvent
	| SliceSimulatorOpenSegmentEvent
	| SliceSimulatorIsNotRunningSegmentEvent
	| PageViewSegmentEvent
	| OpenVideoTutorialsSegmentEvent
	| CustomTypeCreatedSegmentEvent
	| CustomTypeFieldAddedSegmentEvent
	| CustomTypeSliceZoneUpdatedSegmentEvent
	| CustomTypeOpenAddFromTemplatesEvent
	| CustomTypeSavedSegmentEvent
	| SliceCreatedSegmentEvent
	| LegacySliceConvertedSegmentEvent
	| ScreenshotTakenSegmentEvent
	| ChangesPushedSegmentEvent
	| ChangesLimitReachSegmentEvent
	| EditorWidgetUsedSegmentEvent
	| OpenPageSnippetSegmentEvent
	| CopyPageSnippetSegmentEvent
	| UsersInviteButtonClickedSegmentEvent
	| SwitchEnvironmentSegmentEvent;

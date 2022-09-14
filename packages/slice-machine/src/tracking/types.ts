import { Frameworks } from "@slicemachine/core/build/models";

export enum EventNames {
  Review = "SliceMachine Review",
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
  SliceSimulatorSetup = "SliceMachine Slice Simulator Setup",
  SliceSimulatorOpen = "SliceMachine Slice Simulator Open",
  PageView = "SliceMachine Page View",
  OpenVideoTutorials = "SliceMachine Open Video Tutorials",
  CreateCustomType = "SliceMachine Custom Type Created",
  CustomTypeFieldAdded = "SliceMachine Custom Type Field Added",
  CustomTypeSliceZoneUpdated = "SliceMachine Slicezone Updated",
  CustomTypeSaved = "SliceMachine Custom Type Saved",
  CustomTypePushed = "SliceMachine Custom Type Pushed",
  SliceCreated = "SliceMachine Slice Created",
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",

  IdentifyUser = "IdentifyUser",
  GroupLibraries = "GroupLibraries",

  ScreenshotTaken = "SliceMachine Screenshot Taken",
}

type BaseTrackingEvent = {
  name: EventNames;
  props?: Record<string, unknown>;
};

export interface PageView extends BaseTrackingEvent {
  name: EventNames.PageView;
  props: {
    url: string;
    path: string;
    search: string;
    title: string;
    referrer: string;
    framework: Frameworks;
    slicemachineVersion: string;
  };
}

export interface IdentifyUser extends BaseTrackingEvent {
  name: EventNames.IdentifyUser;
}

export interface GroupLibraries extends BaseTrackingEvent {
  name: EventNames.GroupLibraries;
  props: {
    repoName: string;
    manualLibsCount: number;
    downloadedLibsCount: number;
    npmLibsCount: number;
    downloadedLibs: Array<string>;
    slicemachineVersion: string;
  };
}

export interface OpenVideoTutorials extends BaseTrackingEvent {
  name: EventNames.OpenVideoTutorials;
  props: {
    framework: Frameworks;
    slicemachineVersion: string; // why is this one different ?
  };
}

export interface Review extends BaseTrackingEvent {
  name: EventNames.Review;
  props: {
    framework: Frameworks;
    rating: number;
    comment: string;
  };
}

export interface SliceSimulatorSetup extends BaseTrackingEvent {
  name: EventNames.SliceSimulatorSetup;
  props: {
    framework: Frameworks;
    version: string;
  };
}

export interface SliceSimulatorOpen extends BaseTrackingEvent {
  name: EventNames.SliceSimulatorOpen;
  props: {
    version: string;
    framework: Frameworks;
  };
}

export interface OnboardingStart extends BaseTrackingEvent {
  name: EventNames.OnboardingStart;
}

export interface OnboardingContinue extends BaseTrackingEvent {
  name:
    | EventNames.OnboardingContinueIntro
    | EventNames.OnboardingContinueScreen1
    | EventNames.OnboardingContinueScreen2
    | EventNames.OnboardingContinueScreen3;
}

export interface OnboardingSkip extends BaseTrackingEvent {
  name: EventNames.OnboardingSkip;
  props: {
    screenSkipped: number;
  };
}

export interface CreateCustomType extends BaseTrackingEvent {
  name: EventNames.CreateCustomType;
  props: {
    id: string;
    name: string;
    type: "repeatable" | "single";
  };
}

export interface CustomTypeFieldAdded extends BaseTrackingEvent {
  name: EventNames.CustomTypeFieldAdded;
  props: {
    id: string; // field id
    name: string; // custom type id
    zone: "static" | "repeatable";
    type: string;
  };
}

export interface CustomTypeSliceZoneUpdated extends BaseTrackingEvent {
  name: EventNames.CustomTypeSliceZoneUpdated;
  props: {
    customTypeId: string;
  };
}

export interface CustomTypeSaved extends BaseTrackingEvent {
  name: EventNames.CustomTypeSaved;
  props: {
    id: string;
    name: string;
    type: "single" | "repeatable";
  };
}

export interface CustomTypePushed extends BaseTrackingEvent {
  name: EventNames.CustomTypePushed;
  props: {
    id: string;
    name: string;
    type: "single" | "repeatable";
  };
}

export interface CreateSlice extends BaseTrackingEvent {
  name: EventNames.SliceCreated;
  props: {
    id: string;
    name: string;
    library: string;
  };
}

export interface ScreenshotTaken extends BaseTrackingEvent {
  name: EventNames.ScreenshotTaken;
  props: {
    type: "custom" | "automatic";
  };
}

export type TrackingEvents =
  | PageView
  | IdentifyUser
  | GroupLibraries
  | OpenVideoTutorials
  | Review
  | OnboardingStart
  | OnboardingContinue
  | OnboardingSkip
  | CreateCustomType
  | CustomTypeFieldAdded
  | CustomTypeSliceZoneUpdated
  | CustomTypeSaved
  | CustomTypePushed
  | CreateSlice
  | SliceSimulatorOpen
  | SliceSimulatorSetup
  | ScreenshotTaken;

export function isTrackingEvent(
  payload: TrackingEvents
): payload is TrackingEvents {
  const names = Object.values(EventNames);
  return payload.name && names.includes(payload.name);
}

export function isGroupLibrariesEvent(
  payload: TrackingEvents
): payload is GroupLibraries {
  return payload.name === EventNames.GroupLibraries;
}

export function isIdentifyUserEvent(
  payload: TrackingEvents
): payload is IdentifyUser {
  return payload.name === EventNames.IdentifyUser;
}

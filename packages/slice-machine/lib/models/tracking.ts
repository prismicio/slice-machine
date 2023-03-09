import { Frameworks } from "@lib/models/common/Framework";
// import type { LimitType } from "@slicemachine/client";
// import { InvalidCustomTypeResponse } from "./common/TransactionalPush";

export enum EventNames {
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
  SliceSimulatorSetup = "SliceMachine Slice Simulator Setup",
  SliceSimulatorOpen = "SliceMachine Slice Simulator Open",
  SliceSimulatorIsNotRunning = "SliceMachine Slice Simulator is not running",
  PageView = "SliceMachine Page View",
  OpenVideoTutorials = "SliceMachine Open Video Tutorials",
  SliceCreated = "SliceMachine Slice Created",
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",

  IdentifyUser = "IdentifyUser",
  GroupLibraries = "GroupLibraries",

  ScreenshotTaken = "SliceMachine Screenshot Taken",
  ChangesPushed = "SliceMachine Changes Pushed",
  ChangesLimitReach = "SliceMachine Changes Limit Reach",

  EditorWidgetUsed = "SliceMachine Editor Widget Used",
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
    video: string;
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

export interface SliceSimulatorIsNotRunning extends BaseTrackingEvent {
  name: EventNames.SliceSimulatorIsNotRunning;
  props: {
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
    method: "fromSimulator" | "upload" | "dragAndDrop";
  };
}

export interface ChangesPushed extends BaseTrackingEvent {
  name: EventNames.ChangesPushed;
  props: {
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
  };
}

// TODO #DELETE
export interface ChangesLimitReach extends BaseTrackingEvent {
  name: EventNames.ChangesLimitReach;
  props: {
    // limitType: LimitType | InvalidCustomTypeResponse["type"];
  };
}

export interface EditorWidgetUsed extends BaseTrackingEvent {
  name: EventNames.EditorWidgetUsed;
  props: {
    sliceId: string;
  };
}

export type TrackingEvents =
  | PageView
  | IdentifyUser
  | GroupLibraries
  | OpenVideoTutorials
  | OnboardingStart
  | OnboardingContinue
  | OnboardingSkip
  | CreateSlice
  | SliceSimulatorOpen
  | SliceSimulatorSetup
  | SliceSimulatorIsNotRunning
  | ScreenshotTaken
  | ChangesPushed
  | ChangesLimitReach
  | EditorWidgetUsed;

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

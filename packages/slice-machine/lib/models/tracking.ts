// import type { LimitType } from "@slicemachine/client";
// import { InvalidCustomTypeResponse } from "./common/TransactionalPush";

export enum EventNames {
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
  | GroupLibraries
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
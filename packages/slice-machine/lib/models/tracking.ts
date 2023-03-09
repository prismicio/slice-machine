// import type { LimitType } from "@slicemachine/client";
// import { InvalidCustomTypeResponse } from "./common/TransactionalPush";

export enum EventNames {
  ChangesLimitReach = "SliceMachine Changes Limit Reach",

  EditorWidgetUsed = "SliceMachine Editor Widget Used",
}

type BaseTrackingEvent = {
  name: EventNames;
  props?: Record<string, unknown>;
};

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

export type TrackingEvents = ChangesLimitReach | EditorWidgetUsed;

export function isTrackingEvent(
  payload: TrackingEvents
): payload is TrackingEvents {
  const names = Object.values(EventNames);
  return payload.name && names.includes(payload.name);
}

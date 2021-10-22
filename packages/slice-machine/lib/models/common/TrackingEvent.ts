export enum TrackingEventId {
  REVIEW = "slicemachine_review",
}

export type TrackingEvent = {
  id: string;
};

export type ReviewTrackingEvent = TrackingEvent & {
  id: TrackingEventId.REVIEW;
  framework: string;
  rating: number;
  comment: string;
};

export enum TrackingEventId {
  REVIEW = "slicemachine_review",
}

export type TrackingEvent = {
  id: string;
};

/** Tracking review routes SM API contract */

export type TrackingReviewRequest = {
  rating: number;
  comment: string;
};

export type TrackingReviewResponse = {};

/** Tracking review routes Tracking API contract */

export type ReviewTrackingEvent = TrackingEvent & {
  id: TrackingEventId.REVIEW;
  framework: string;
  rating: number;
  comment: string;
};

export enum TrackingEventId {
  REVIEW = "slicemachine_review",
  ONBOARDING = "slicemachine_onboarding",
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

export type OnboardingTrackingEvent = TrackingEvent & {
  id: TrackingEventId.ONBOARDING;
  lastStep: number;
  maxSteps: number;
  startTime: number;
  endTime: number;
  totalTime: number;
};

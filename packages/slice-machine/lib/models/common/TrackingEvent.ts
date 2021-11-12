export enum TrackingEventId {
  REVIEW = "slicemachine_review",
  ONBOARDING_START = "slicemachine_onboarding_start",
  ONBOARDING_SKIP = "slicemachine_onboarding_skip",
  ONBOARDING_CONTINUE_SCREEN_INTRO = "slicemachine_onboarding_continue_screen_intro",
  ONBOARDING_FIRST = "slicemachine_onboarding_continue_1",
  ONBOARDING_SECOND = "slicemachine_onboarding_continue_2",
  ONBOARDING_THIRD = "slicemachine_onboarding_continue_3",
  ONBOARDING_END = "slicemachine_onboarding_end",
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

export type OnboardingEventIds =
  | TrackingEventId.ONBOARDING_START
  | TrackingEventId.ONBOARDING_CONTINUE_SCREEN_INTRO
  | TrackingEventId.ONBOARDING_FIRST
  | TrackingEventId.ONBOARDING_SECOND
  | TrackingEventId.ONBOARDING_THIRD
  | TrackingEventId.ONBOARDING_SKIP
  | TrackingEventId.ONBOARDING_END;

export type OnboardingTrackingEvent = TrackingEvent & {
  id: OnboardingEventIds;
  time: number;
};

export type OnboardingStartEvent = OnboardingTrackingEvent & {
  id: TrackingEventId.ONBOARDING_START;
};

export type OnboardingSkipEvent = OnboardingTrackingEvent & {
  id: TrackingEventId.ONBOARDING_SKIP;
  screen: number;
  completed?: boolean;
};

export type OnboardingContinueEvent = OnboardingTrackingEvent & {
  id:
    | TrackingEventId.ONBOARDING_CONTINUE_SCREEN_INTRO
    | TrackingEventId.ONBOARDING_FIRST
    | TrackingEventId.ONBOARDING_SECOND
    | TrackingEventId.ONBOARDING_THIRD;
};

export type OnboardingContinueWithVideoEvent = OnboardingContinueEvent & {
  id:
    | TrackingEventId.ONBOARDING_FIRST
    | TrackingEventId.ONBOARDING_SECOND
    | TrackingEventId.ONBOARDING_THIRD;
  completed: boolean;
};

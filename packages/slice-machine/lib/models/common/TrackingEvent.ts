
export enum TrackingEventId {
  REVIEW = "slicemachine_review",
  ONBOARDING_START = 'slicemachine_onboarding_start',
  ONBOARDING_SKIP = 'slicemachine_onboarding_skip',
  ONBOARDING_CONTINUE_SCREEN_INTRO ='slicemachine_continue_screen_intro',
  ONBOARDING_FIRST = 'slicemachine_onboarding_continue_1',
  ONBOARDING_SECOND = 'slicemachine_onboarding_continue_2',
  ONBOARDING_THIRD = 'slicemachine_onboarding_continue_3',
  ONBOARDING_END = 'slicemachine_onboarding_end'
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

export type OnboardingEventIds = TrackingEventId.ONBOARDING_START | TrackingEventId.ONBOARDING_CONTINUE_SCREEN_INTRO | TrackingEventId.ONBOARDING_FIRST | TrackingEventId.ONBOARDING_SECOND | TrackingEventId.ONBOARDING_THIRD | TrackingEventId.ONBOARDING_SKIP | TrackingEventId.ONBOARDING_END

interface OnboardingTrackingEvent extends TrackingEvent {
  id: OnboardingEventIds;
  time: number;
}

export interface OnboardingStartEvent extends OnboardingTrackingEvent {
  id: TrackingEventId.ONBOARDING_START;
}

export interface OnboardingSkipEvent extends OnboardingTrackingEvent {
  id: TrackingEventId.ONBOARDING_SKIP;
  screen: number;
  completed?: boolean;
}

export interface OnboardingContinueEvent extends OnboardingTrackingEvent {
  id: TrackingEventId.ONBOARDING_CONTINUE_SCREEN_INTRO | TrackingEventId.ONBOARDING_FIRST | TrackingEventId.ONBOARDING_SECOND | TrackingEventId.ONBOARDING_THIRD
}

export interface OnBoardingContinueWithVideoEvent extends OnboardingContinueEvent {
  id: TrackingEventId.ONBOARDING_FIRST | TrackingEventId.ONBOARDING_SECOND | TrackingEventId.ONBOARDING_THIRD
  completed: boolean;
}


// export type OnboardingTrackingEvent = TrackingEvent & {
//   id: OnboardingTrackingEvent;
//   lastStep: number;
//   maxSteps: number;
//   startTime: number;
//   endTime: number;
//   totalTime: number;
// };

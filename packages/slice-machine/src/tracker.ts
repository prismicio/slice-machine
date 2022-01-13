import type { Analytics as ClientAnalytics } from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { Frameworks } from "@slicemachine/core/build/src/models";

// These events should be sync with the tracking Plan on segment.
type AllSliceMachineEventType = EventType | ContinueOnboardingType;

enum EventType {
  Review = "SliceMachine Review",
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
  SlicePreviewSetup = "Slice Preview Setup",
  SlicePreview = "Slice Preview",
}

export enum ContinueOnboardingType {
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",
}

let _client: ClientAnalytics | null = null;
let _isTrackingActive = true;

/** Private methods **/

// Native client event method (don't expose these functions)
const _trackEvent = (
  eventType: AllSliceMachineEventType,
  attributes: Record<string, unknown> = {}
): void => {
  if (!_isTrackingPossible(_client)) {
    return;
  }

  _client
    .track(eventType, attributes)
    .catch(() =>
      console.warn(`Couldn't report event ${eventType}: Tracking error`)
    );
};

const _identify = (userId: string): void => {
  if (!_isTrackingPossible(_client)) {
    return;
  }

  _client
    .identify(userId)
    .catch(() => console.warn(`Couldn't report identify: Tracking error`));
};

const _isTrackingPossible = (
  client: ClientAnalytics | null
): client is ClientAnalytics => _isTrackingActive && !!client;

/** Public methods **/

const initialize = async (
  segmentKey: string,
  isTrackingActive = true
): Promise<void> => {
  try {
    _isTrackingActive = isTrackingActive;
    // We avoid rewriting a new client if we have already one
    if (!!_client) return;
    _client = await AnalyticsBrowser.standalone(segmentKey);
  } catch (error) {
    // If the client is not correctly setup we are silently failing as the tracker is not a critical feature
    console.warn(error);
  }
};

const identifyUser = (userId: string): void => {
  _identify(userId);
};

const trackReview = (
  framework: Frameworks,
  rating: number,
  comment: string
): void => {
  _trackEvent(EventType.Review, { rating, comment, framework });
};

const trackSlicePreviewSetup = (
  framework: Frameworks,
  version: string
): void => {
  _trackEvent(EventType.SlicePreviewSetup, { version, framework });
};

const trackOpenSlicePreview = (
  framework: Frameworks,
  version: string
): void => {
  _trackEvent(EventType.SlicePreview, { version, framework });
};

const trackOnboardingStart = (): void => {
  _trackEvent(EventType.OnboardingStart);
};

const trackOnboardingContinue = (
  continueOnboardingEventType: ContinueOnboardingType
): void => {
  _trackEvent(continueOnboardingEventType);
};

const trackOnboardingSkip = (screenSkipped: number): void => {
  _trackEvent(EventType.OnboardingSkip, {
    screenSkipped,
  });
};

// Don't expose native tracking functions
export default {
  initialize,
  identifyUser,
  trackReview,
  trackSlicePreviewSetup,
  trackOpenSlicePreview,
  trackOnboardingSkip,
  trackOnboardingStart,
  trackOnboardingContinue,
};

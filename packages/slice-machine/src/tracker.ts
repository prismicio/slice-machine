import type { Analytics as ClientAnalytics } from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";
import {Frameworks} from "@slicemachine/core/build/src/models";

// These events should be sync with the tracking Plan on segment.
export enum EventType {
  Review = "SliceMachine Review",
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",
  SlicePreviewSetup = "Slice Preview Setup",
  SlicePreview = "Slice Preview",
}

let _client: ClientAnalytics | null = null;
let _isTrackingActive: boolean = true;

// Track event method
const _trackEvent = (
  eventType: EventType,
  attributes: Record<string, unknown> = {}
): void => {
  if(_isTrackingActive) return;

  if (!_client) {
    console.warn(`Couldn't report event ${eventType} : Client tracker not defined`);
    return;
  }

  _client
    .track(eventType, attributes)
    .catch(() => console.warn(`Couldn't report event ${eventType}: Tracking error`));
};

export const initialize = async (segmentKey: string, isTrackingActive: boolean = true): Promise<void> => {
  try {
    _isTrackingActive = isTrackingActive
    // We avoid rewriting a new client if we have already one
    if (!!_client) return;
    _client = await AnalyticsBrowser.standalone(segmentKey);
  } catch (error) {
    // If the client is not correctly setup we are silently failing as the tracker is not a critical feature
    console.warn(error);
  }
};

export const trackReview = (
  framework: Frameworks,
  rating: number,
  comment: string
) => {
  _trackEvent(EventType.Review, { rating, comment, framework });
};

export const SlicePreviewSetup = (framework: Frameworks, version: string): void => {
  return this.trackEvent(EventType.SlicePreviewSetup, { version, framework });
}

export const OpenSlicePreview = (framework: Frameworks, version: string): void => {
  return this.trackEvent(EventType.SlicePreview, { version, framework });
}

export default {
  initialize,
  trackReview,
  SlicePreviewSetup,
  OpenSlicePreview
};

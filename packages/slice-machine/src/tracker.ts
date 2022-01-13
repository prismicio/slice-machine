import type { Analytics as ClientAnalytics } from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { Frameworks } from "@slicemachine/core/build/src/models";
import { LibraryUI } from "@models/common/LibraryUI";

// These events should be sync with the tracking Plan on segment.
type AllSliceMachineEventType = EventType | ContinueOnboardingType;

enum EventType {
  Review = "SliceMachine Review",
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
  SlicePreviewSetup = "SliceMachine Slice Preview Setup",
  SlicePreviewOpen = "SliceMachine Slice Preview Open",
}

export enum ContinueOnboardingType {
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",
}

let _client: ClientAnalytics | null = null;
let _isTrackingActive = true;
let _repoName: string | null = null;

/*
 * TEMPORARY
 * Today, we need to have access to the cookie to get the anonymousID from segment but
 * we want to log that event only at start time. Because of the necessity to access the cookies,
 * we can't put that code on the start script just yet.
 * We need to define a potential alternative for this event.
 * In the meantime, this flag prevents the event flood
 */
let _temp_first_start_flag = true;

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

const _group = (attributes: Record<string, unknown> = {}): void => {
  if (!_isTrackingPossible(_client)) {
    return;
  }

  if (!_repoName) {
    return;
  }

  try {
    _client.group(_repoName, attributes);
  } catch {
    console.warn(`Couldn't report group: Tracking error`);
  }
};

const _isTrackingPossible = (
  client: ClientAnalytics | null
): client is ClientAnalytics => _isTrackingActive && !!client;

/** Public methods **/

const initialize = async (
  segmentKey: string,
  repoName: string | null = null,
  isTrackingActive = true
): Promise<void> => {
  try {
    _isTrackingActive = isTrackingActive;
    _repoName = repoName;
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

const groupLibraries = (libs: readonly LibraryUI[], version: string): void => {
  if (!_temp_first_start_flag) {
    return;
  }

  _temp_first_start_flag = false;

  const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

  _group({
    manualLibsCount: libs.filter((l) => l.meta.isManual).length,
    downloadedLibsCount: downloadedLibs.length,
    npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
    downloadedLibs: downloadedLibs.map((l) => l.meta.name || "Unknown"),
    slicemachineVersion: version,
  });
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
  _trackEvent(EventType.SlicePreviewOpen, { version, framework });
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
  groupLibraries,
};

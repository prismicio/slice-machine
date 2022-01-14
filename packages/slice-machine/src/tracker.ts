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

export class SMTracker {
  #client: ClientAnalytics | null = null;
  #isTrackingActive = true;
  #repoName: string | null = null;
  constructor() {}

  async initialize(
    segmentKey: string,
    repoName: string | null = null,
    isTrackingActive = true
  ): Promise<void> {
    try {
      this.#isTrackingActive = isTrackingActive;
      this.#repoName = repoName;
      // We avoid rewriting a new client if we have already one
      if (!!this.#client) return;
      this.#client = await AnalyticsBrowser.standalone(segmentKey);
    } catch (error) {
      // If the client is not correctly setup we are silently failing as the tracker is not a critical feature
      console.warn(error);
    }
  }

  /** Private methods **/

  #trackEvent(
    eventType: AllSliceMachineEventType,
    attributes: Record<string, unknown> = {}
  ): void {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    this.#client
      .track(eventType, attributes)
      .catch(() =>
        console.warn(`Couldn't report event ${eventType}: Tracking error`)
      );
  }

  #identify(userId: string): void {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    this.#client
      .identify(userId)
      .catch(() => console.warn(`Couldn't report identify: Tracking error`));
  }

  #group(attributes: Record<string, unknown> = {}): void {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    if (!this.#repoName) {
      return;
    }

    try {
      this.#client.group(this.#repoName, attributes);
    } catch {
      console.warn(`Couldn't report group: Tracking error`);
    }
  }

  #isTrackingPossible(
    client: ClientAnalytics | null
  ): client is ClientAnalytics {
    return this.#isTrackingActive && !!client;
  }

  /** Public methods **/

  identifyUser(userId: string): void {
    this.#identify(userId);
  }

  groupLibraries(libs: readonly LibraryUI[], version: string): void {
    const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

    this.#group({
      manualLibsCount: libs.filter((l) => l.meta.isManual).length,
      downloadedLibsCount: downloadedLibs.length,
      npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
      downloadedLibs: downloadedLibs.map((l) => l.meta.name || "Unknown"),
      slicemachineVersion: version,
    });
  }

  trackReview(framework: Frameworks, rating: number, comment: string): void {
    this.#trackEvent(EventType.Review, { rating, comment, framework });
  }

  trackSlicePreviewSetup(framework: Frameworks, version: string): void {
    this.#trackEvent(EventType.SlicePreviewSetup, { version, framework });
  }

  trackOpenSlicePreview(framework: Frameworks, version: string): void {
    this.#trackEvent(EventType.SlicePreviewOpen, { version, framework });
  }

  trackOnboardingStart(): void {
    this.#trackEvent(EventType.OnboardingStart);
  }

  trackOnboardingContinue(
    continueOnboardingEventType: ContinueOnboardingType
  ): void {
    this.#trackEvent(continueOnboardingEventType);
  }

  trackOnboardingSkip(screenSkipped: number): void {
    this.#trackEvent(EventType.OnboardingSkip, {
      screenSkipped,
    });
  }
}

const Tracker = (() => {
  let smTrackerInstance: SMTracker;

  const init = () => new SMTracker();

  return {
    get() {
      if (!smTrackerInstance) smTrackerInstance = init();
      return smTrackerInstance;
    },
  };
})();

export default Tracker;

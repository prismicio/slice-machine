import type { Analytics as ClientAnalytics } from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { Frameworks } from "@slicemachine/core/build/models";
import { LibraryUI } from "@models/common/LibraryUI";

// These events should be sync with the tracking Plan on segment.
type AllSliceMachineEventType = EventType | ContinueOnboardingType;

enum EventType {
  Review = "SliceMachine Review",
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
  SliceSimulatorSetup = "SliceMachine Slice Simulator Setup",
  SliceSimulatorOpen = "SliceMachine Slice Simulator Open",
  PageView = "SliceMachine Page View",
  OpenVideoTutorials = "SliceMachine Open Video Tutorials",
}

export enum ContinueOnboardingType {
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",
}

export class SMTracker {
  #client: Promise<ClientAnalytics> | null = null;
  #isTrackingActive = true;

  initialize(segmentKey: string, isTrackingActive = true): void {
    try {
      this.#isTrackingActive = isTrackingActive;
      // We avoid rewriting a new client if we have already one
      if (!!this.#client) return;
      this.#client = AnalyticsBrowser.standalone(segmentKey);
    } catch (error) {
      // If the client is not correctly setup we are silently failing as the tracker is not a critical feature
      console.warn(error);
    }
  }

  /** Private methods **/

  async #trackEvent(
    eventType: AllSliceMachineEventType,
    attributes: Record<string, unknown> = {}
  ): Promise<void> {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    return this.#client
      .then((client): void => {
        void client.track(eventType, attributes);
      })
      .catch(() =>
        console.warn(`Couldn't report event ${eventType}: Tracking error`)
      );
  }

  async #identify(userId: string): Promise<void> {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    return this.#client
      .then((client): void => {
        void client.identify(
          userId,
          {},
          {
            integrations: {
              Intercom: {
                user_hash: `<%= OpenSSL::HMAC.hexdigest("sha256", "H-tsAB1jNCF4ps3e-yD9jfJc0sJaWtaTZHy_C5SA", ${userId}) %>`,
              },
            },
          }
        );
      })
      .catch(() => console.warn(`Couldn't report identify: Tracking error`));
  }

  async #group(
    groupId: string,
    attributes: Record<string, unknown> = {}
  ): Promise<void> {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    return this.#client
      .then((client): void => {
        void client.group(groupId, attributes);
      })
      .catch(() => console.warn(`Couldn't report group: Tracking error`));
  }

  #isTrackingPossible(
    client: Promise<ClientAnalytics> | null
  ): client is Promise<ClientAnalytics> {
    return this.#isTrackingActive && !!client;
  }

  /** Public methods **/

  async trackPageView(framework: Frameworks, version: string): Promise<void> {
    await this.#trackEvent(EventType.PageView, {
      url: window.location.href,
      path: window.location.pathname,
      search: window.location.search,
      title: document.title,
      referrer: document.referrer,
      framework,
      slicemachineVersion: version,
    });
  }

  async identifyUser(userId: string): Promise<void> {
    await this.#identify(userId);
  }

  async groupLibraries(
    libs: readonly LibraryUI[],
    repoName: string | undefined,
    version: string
  ): Promise<void> {
    if (!repoName) {
      return;
    }

    const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

    await this.#group(repoName, {
      repoName: repoName,
      manualLibsCount: libs.filter((l) => l.meta.isManual).length,
      downloadedLibsCount: downloadedLibs.length,
      npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
      downloadedLibs: downloadedLibs.map((l) => l.meta.name || "Unknown"),
      slicemachineVersion: version,
    });
  }

  async trackClickOnVideoTutorials(
    framework: Frameworks,
    version: string
  ): Promise<void> {
    await this.#trackEvent(EventType.OpenVideoTutorials, {
      framework,
      slicemachineVersion: version,
    });
  }

  async trackReview(
    framework: Frameworks,
    rating: number,
    comment: string
  ): Promise<void> {
    return this.#trackEvent(EventType.Review, { rating, comment, framework });
  }

  async trackSliceSimulatorSetup(
    framework: Frameworks,
    version: string
  ): Promise<void> {
    return this.#trackEvent(EventType.SliceSimulatorSetup, {
      version,
      framework,
    });
  }

  async trackOpenSliceSimulator(
    framework: Frameworks,
    version: string
  ): Promise<void> {
    return this.#trackEvent(EventType.SliceSimulatorOpen, {
      version,
      framework,
    });
  }

  async trackOnboardingStart(): Promise<void> {
    return this.#trackEvent(EventType.OnboardingStart);
  }

  async trackOnboardingContinue(
    continueOnboardingEventType: ContinueOnboardingType
  ): Promise<void> {
    return this.#trackEvent(continueOnboardingEventType);
  }

  trackOnboardingSkip(screenSkipped: number): Promise<void> {
    return this.#trackEvent(EventType.OnboardingSkip, {
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

import type {
  Analytics as ClientAnalytics,
  Options,
} from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { Frameworks } from "@slicemachine/core/build/models";
import { LibraryUI } from "../lib/models/common/LibraryUI";

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
  CreateCustomType = "SliceMachine Custom Type Created",
}

export enum ContinueOnboardingType {
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",
}

function addRepoToAttributes(repo: string, attributes: Options): Options {
  return {
    ...attributes,
    context: {
      ...attributes.context,
      groupId: {
        Repository: repo,
      },
    },
  };
}

export class SMTracker {
  #client: Promise<ClientAnalytics> | null = null;
  #isTrackingActive = true;
  #repository = "";

  initialize(segmentKey: string, repo: string, isTrackingActive = true): void {
    this.#repository = repo;
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
    attributes: Record<string, unknown>
  ): Promise<void> {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    return this.#client
      .then((client): void => {
        void client.track(eventType, attributes, {
          context: { groupId: { Repository: this.#repository } },
        });
      })
      .catch(() =>
        console.warn(`Couldn't report event ${eventType}: Tracking error`)
      );
  }

  async #identify(shortId: string, intercomHash: string): Promise<void> {
    if (!this.#isTrackingPossible(this.#client)) {
      return;
    }

    return this.#client
      .then((client): void => {
        void client.identify(
          shortId,
          {},
          {
            integrations: {
              Intercom: {
                user_hash: intercomHash,
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

  async identifyUser(shortId: string, intercomHash: string): Promise<void> {
    await this.#identify(shortId, intercomHash);
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

  async trackOnboardingSkip(screenSkipped: number): Promise<void> {
    return this.#trackEvent(EventType.OnboardingSkip, {
      screenSkipped,
    });
  }

  async trackCreateCustomType(customTypeInfo: {
    id: string;
    name: string;
    repeatable: boolean;
  }): Promise<void> {
    const { id, name, repeatable } = customTypeInfo;
    const type = repeatable ? "repeatable" : "single";

    const data = { id, name, type };

    return this.#trackEvent(EventType.CreateCustomType, data);
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

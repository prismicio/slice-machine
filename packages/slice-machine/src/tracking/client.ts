import { Frameworks } from "@lib/models/common/Framework";
import axios from "axios";
import { LibraryUI } from "../../lib/models/common/LibraryUI";
import {
  EventNames,
  TrackingEvents,
  IdentifyUser,
  GroupLibraries,
  PageView,
  OpenVideoTutorials,
  OnboardingContinue,
  CreateSlice,
  ScreenshotTaken,
  ChangesPushed,
  SliceSimulatorIsNotRunning,
  ChangesLimitReach,
} from "../../lib/models/tracking";

export class SMTracker {
  #client = (event: TrackingEvents) =>
    axios.post("/api/s", event).then(() => void 0);
  #isTrackingActive = true;

  initialize(isTrackingActive = true): void {
    this.#isTrackingActive = isTrackingActive;
  }

  /** Private methods **/

  async #trackEvent(event: TrackingEvents): Promise<void> {
    if (!this.#isTrackingActive) {
      return;
    }

    return this.#client(event).catch(() =>
      console.warn(`Couldn't report event ${event.name}: Tracking error`)
    );
  }

  async #identify(): Promise<void> {
    if (!this.#isTrackingActive) {
      return;
    }

    const payload: IdentifyUser = {
      name: EventNames.IdentifyUser,
    };

    return this.#client(payload).catch(() =>
      console.warn(`Couldn't report identify: Tracking error`)
    );
  }

  /** Public methods **/

  async trackPageView(framework: Frameworks, version: string): Promise<void> {
    const payload: PageView = {
      name: EventNames.PageView,
      props: {
        url: window.location.href,
        path: window.location.pathname,
        search: window.location.search,
        title: document.title,
        referrer: document.referrer,
        framework,
        slicemachineVersion: version,
      },
    };

    await this.#trackEvent(payload);
  }

  async identifyUser(): Promise<void> {
    await this.#identify();
  }

  async groupLibraries(
    libs: readonly LibraryUI[],
    repoName: string | undefined,
    version: string
  ): Promise<void> {
    if (repoName === undefined || !this.#isTrackingActive) {
      return;
    }

    const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

    const payload: GroupLibraries = {
      name: EventNames.GroupLibraries,
      props: {
        repoName: repoName,
        manualLibsCount: libs.filter((l) => l.meta.isManual).length,
        downloadedLibsCount: downloadedLibs.length,
        npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
        downloadedLibs: downloadedLibs.map((l) =>
          l.meta.name != null ? l.meta.name : "Unknown"
        ),
        slicemachineVersion: version,
      },
    };

    await this.#client(payload).catch(() =>
      console.warn(`Couldn't report group: Tracking error`)
    );
  }

  async trackClickOnVideoTutorials(
    framework: Frameworks,
    version: string,
    video: string
  ): Promise<void> {
    const payload: OpenVideoTutorials = {
      name: EventNames.OpenVideoTutorials,
      props: {
        framework,
        slicemachineVersion: version,
        video,
      },
    };
    await this.#trackEvent(payload);
  }

  async trackSliceSimulatorIsNotRunning(framework: Frameworks): Promise<void> {
    const payload: SliceSimulatorIsNotRunning = {
      name: EventNames.SliceSimulatorIsNotRunning,
      props: { framework },
    };

    return this.#trackEvent(payload);
  }

  async trackOnboardingContinue(
    continueOnboardingEventType: OnboardingContinue["name"]
  ): Promise<void> {
    const payload: OnboardingContinue = {
      name: continueOnboardingEventType,
    };
    return this.#trackEvent(payload);
  }

  async trackCreateSlice(data: {
    id: string;
    name: string;
    library: string;
  }): Promise<void> {
    const payload: CreateSlice = {
      name: EventNames.SliceCreated,
      props: data,
    };
    return this.#trackEvent(payload);
  }

  async trackScreenshotTaken(data: ScreenshotTaken["props"]): Promise<void> {
    const payload: ScreenshotTaken = {
      name: EventNames.ScreenshotTaken,
      props: data,
    };
    return this.#trackEvent(payload);
  }

  async trackChangesPushed(data: ChangesPushed["props"]): Promise<void> {
    const payload: ChangesPushed = {
      name: EventNames.ChangesPushed,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  async trackChangesLimitReach(
    data: ChangesLimitReach["props"]
  ): Promise<void> {
    const payload: ChangesLimitReach = {
      name: EventNames.ChangesLimitReach,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  #startedNewEditorSession = false;
  editor = {
    startNewSession: () => {
      this.#startedNewEditorSession = true;
    },
    trackWidgetUsed: (sliceId: string) => {
      if (!this.#startedNewEditorSession) return;

      this.#startedNewEditorSession = false;

      void this.#trackEvent({
        name: EventNames.EditorWidgetUsed,
        props: { sliceId },
      });
    },
  };
}

const Tracker = (() => {
  let smTrackerInstance: SMTracker | undefined;

  const init = () => new SMTracker();

  return {
    get() {
      if (smTrackerInstance === undefined) smTrackerInstance = init();
      return smTrackerInstance;
    },
  };
})();

export default Tracker;

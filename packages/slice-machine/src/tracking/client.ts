import { Frameworks } from "@slicemachine/core/build/models";
import axios from "axios";
import { LibraryUI } from "../../lib/models/common/LibraryUI";
import {
  EventNames,
  TrackingEvents,
  IdentifyUser,
  GroupLibraries,
  PageView,
  OpenVideoTutorials,
  Review,
  SliceSimulatorSetup,
  SliceSimulatorOpen,
  OnboardingStart,
  OnboardingContinue,
  OnboardingSkip,
  CreateCustomType,
  CustomTypeFieldAdded,
  CustomTypeSliceZoneUpdated,
  CustomTypeSaved,
  CustomTypePushed,
  CreateSlice,
} from "./types";

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
    if (!repoName || !this.#isTrackingActive) {
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
        downloadedLibs: downloadedLibs.map((l) => l.meta.name || "Unknown"),
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

  async trackReview(
    framework: Frameworks,
    rating: number,
    comment: string
  ): Promise<void> {
    const payload: Review = {
      name: EventNames.Review,
      props: {
        framework,
        rating,
        comment,
      },
    };
    return this.#trackEvent(payload);
  }

  async trackSliceSimulatorSetup(
    framework: Frameworks,
    version: string
  ): Promise<void> {
    const payload: SliceSimulatorSetup = {
      name: EventNames.SliceSimulatorSetup,
      props: { framework, version },
    };
    return this.#trackEvent(payload);
  }

  async trackOpenSliceSimulator(
    framework: Frameworks,
    version: string
  ): Promise<void> {
    const payload: SliceSimulatorOpen = {
      name: EventNames.SliceSimulatorOpen,
      props: { framework, version },
    };

    return this.#trackEvent(payload);
  }

  async trackOnboardingStart(): Promise<void> {
    const payload: OnboardingStart = {
      name: EventNames.OnboardingStart,
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

  async trackOnboardingSkip(screenSkipped: number): Promise<void> {
    const payload: OnboardingSkip = {
      name: EventNames.OnboardingSkip,
      props: {
        screenSkipped,
      },
    };

    return this.#trackEvent(payload);
  }

  async trackCreateCustomType(customTypeInfo: {
    id: string;
    name: string;
    repeatable: boolean;
  }): Promise<void> {
    const { id, name, repeatable } = customTypeInfo;

    const payload: CreateCustomType = {
      name: EventNames.CreateCustomType,
      props: { id, name, type: repeatable ? "repeatable" : "single" },
    };

    return this.#trackEvent(payload);
  }

  async trackCustomTypeFieldAdded({
    fieldId,
    customTypeId,
    zone,
    type,
  }: {
    fieldId: string;
    customTypeId: string;
    zone: "static" | "repeatable";
    type: string;
  }): Promise<void> {
    const payload: CustomTypeFieldAdded = {
      name: EventNames.CustomTypeFieldAdded,
      props: {
        id: fieldId,
        name: customTypeId,
        zone,
        type,
      },
    };

    return this.#trackEvent(payload);
  }

  async trackCustomTypeSliceAdded(data: {
    customTypeId: string;
  }): Promise<void> {
    const payload: CustomTypeSliceZoneUpdated = {
      name: EventNames.CustomTypeSliceZoneUpdated,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  async trackCustomTypeSaved(data: {
    id: string;
    name: string;
    type: "single" | "repeatable";
  }): Promise<void> {
    const payload: CustomTypeSaved = {
      name: EventNames.CustomTypeSaved,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  async trackCustomTypePushed(data: {
    id: string;
    name: string;
    type: "single" | "repeatable";
  }): Promise<void> {
    const payload: CustomTypePushed = {
      name: EventNames.CustomTypePushed,
      props: data,
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

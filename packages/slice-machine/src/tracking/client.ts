import axios from "axios";
import { LibraryUI } from "../../lib/models/common/LibraryUI";
import {
  EventNames,
  TrackingEvents,
  GroupLibraries,
  ScreenshotTaken,
  ChangesPushed,
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

  /** Public methods **/

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

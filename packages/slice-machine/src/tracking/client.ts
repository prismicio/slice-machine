import axios from "axios";
import {
  EventNames,
  TrackingEvents,
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

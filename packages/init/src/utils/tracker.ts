import ServerAnalytics from "analytics-node";
import { v4 as uuidv4 } from "uuid";
import { Frameworks } from "@slicemachine/core/build/src/models";

export enum EventType {
  DownloadLibrary = "SliceMachine Download Library",
  InitStart = "SliceMachine Init Start",
  InitDone = "SliceMachine Init Done",
}

type SegmentIdentifier = { userId: string } | { anonymousId: string };

export class InitTracker {
  #client: ServerAnalytics | null = null;
  #isTrackingActive = true;
  #anonymousId = "";
  #userId: string | null = null;

  initialize(segmentKey: string, isTrackingActive = true): void {
    try {
      // The initialize method cannot be used for changing some class properties
      if (!!this.#client) return;

      this.#isTrackingActive = isTrackingActive;
      this.#anonymousId = uuidv4();
      this.#client = new ServerAnalytics(segmentKey);
    } catch (error) {
      // If the client is not correctly setup we are silently failing as the tracker is not a critical feature
    }
  }

  /** Private methods **/

  _trackEvent(
    eventType: EventType,
    attributes: Record<string, unknown> = {}
  ): void {
    if (!this._isTrackingPossible(this.#client)) {
      return;
    }

    const identifier = this._createSegmentIdentifier();

    try {
      this.#client.track({
        event: eventType,
        ...identifier,
        properties: attributes,
      });
    } catch {
      // If the client is not correctly setup we are silently failing as the tracker is not a critical feature
    }
  }

  _identifyEvent(userId: string): void {
    if (!this._isTrackingPossible(this.#client)) {
      return;
    }

    try {
      this.#client.identify({
        userId,
        anonymousId: this.#anonymousId,
      });
    } catch {
      // If the client is not correctly setup we are silently failing as the tracker is not a critical feature
    }
  }

  _isTrackingPossible(
    client: ServerAnalytics | null
  ): client is ServerAnalytics {
    return !!client && this.#isTrackingActive;
  }

  _createSegmentIdentifier(): SegmentIdentifier {
    return this.#userId
      ? { userId: this.#userId }
      : { anonymousId: this.#anonymousId };
  }

  /** Public methods **/

  identifyUser(userId: string): void {
    this.#userId = userId;
    this._identifyEvent(userId);
  }

  trackDownloadLibrary(library: string): void {
    this._trackEvent(EventType.DownloadLibrary, { library });
  }

  trackInitStart(): void {
    this._trackEvent(EventType.InitStart);
  }

  trackInitDone(framework: Frameworks, repo: string): void {
    this._trackEvent(EventType.InitDone, { framework, repo });
  }
}

const Tracker = (() => {
  let smTrackerInstance: InitTracker;

  const init = () => new InitTracker();

  return {
    get() {
      if (!smTrackerInstance) smTrackerInstance = init();
      return smTrackerInstance;
    },
  };
})();

export default Tracker;

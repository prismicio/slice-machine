import ServerAnalytics from "analytics-node";
import { v4 as uuidv4 } from "uuid";
import { Models } from "@prismic-beta/slicemachine-core";

export enum EventType {
  DownloadLibrary = "SliceMachine Download Library",
  InitStart = "SliceMachine Init Start",
  InitIdentify = "SliceMachine Init Identify",
  InitEnd = "SliceMachine Init End",
}

type SegmentIdentifier = { userId: string } | { anonymousId: string };

export class InitTracker {
  #client: ServerAnalytics | null = null;
  #isTrackingActive = true;
  #anonymousId = "";
  #userId: string | null = null;
  #repository: string | null = null;

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
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this._isTrackingPossible(this.#client)) {
        return resolve();
      }

      const identifier = this._createSegmentIdentifier();
      const payload = {
        event: eventType,
        ...identifier,
        properties: attributes,
        ...(this.#repository
          ? { context: { groupId: { Repository: this.#repository } } }
          : {}),
      };

      return this.#client.track(payload, () => {
        // if(_) return reject(_)
        return resolve();
      });
    });
  }

  _identifyEvent(userId: string, intercomHash: string): void {
    if (!this._isTrackingPossible(this.#client)) {
      return;
    }

    try {
      this.#client.identify({
        userId,
        anonymousId: this.#anonymousId,
        integrations: {
          Intercom: {
            user_hash: intercomHash,
          },
        },
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
    return !!this.#userId
      ? { userId: this.#userId }
      : { anonymousId: this.#anonymousId };
  }

  /** Public methods **/

  setRepository(repository: string) {
    this.#repository = repository;
  }

  identifyUser(userId: string, intercomHash: string): void {
    this.#userId = userId;
    return this._identifyEvent(userId, intercomHash);
  }

  trackDownloadLibrary(library: string): Promise<void> {
    return this._trackEvent(EventType.DownloadLibrary, { library });
  }

  trackInitIdentify(): Promise<void> {
    return this._trackEvent(EventType.InitIdentify);
  }

  trackInitStart(repoDomain: string | undefined): Promise<void> {
    if (repoDomain) this.setRepository(repoDomain);
    return this._trackEvent(EventType.InitStart, { repo: repoDomain });
  }

  trackInitEndSuccess(framework: Models.Frameworks): Promise<void> {
    return this._trackEvent(EventType.InitEnd, {
      framework,
      repo: this.#repository,
      result: "success",
    });
  }

  trackInitEndFail(framework: Models.Frameworks, error: string): Promise<void> {
    return this._trackEvent(EventType.InitEnd, {
      framework,
      repo: this.#repository,
      result: "error",
      error,
    });
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

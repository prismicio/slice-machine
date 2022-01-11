/*
 * DUPLICATION
 * this file is a duplication of ServerTracker in sm-ui
 * this duplication has been done on purpose to simplify the merge if init becomes part of sm-ui
 * or if we decide to share the tracker implementation from a lib, but it'll need some refactoring
 * Duplication means no entanglement so don't merge this with the other implem and keep the structure.
 */

import ServerAnalytics from "analytics-node";

export enum EventType {
  DownloadLibrary = "SliceMachine Download Library",
}

export class Tracker {
  constructor(
    readonly analytics: ServerAnalytics,
    readonly repo: string,
    readonly identifier: { userId: string } | { anonymousId: string },
    readonly tracking = true
  ) {}

  static build(
    writeKey: string,
    repo: string | undefined,
    identifier: { userId: string } | { anonymousId: string },
    tracking = true
  ): Tracker | undefined {
    try {
      if (!repo) return;
      const analytics = new ServerAnalytics(writeKey);
      return new Tracker(analytics, repo, identifier, tracking);
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  private trackEvent(
    eventType: EventType,
    attributes: Record<string, unknown> = {}
  ): void {
    this.tracking &&
      this.analytics.track({
        event: eventType,
        ...this.identifier,
        properties: attributes,
      });
  }

  Track = {
    // not called, for demo only
    downloadLibrary: (library: string): void => {
      this.trackEvent(EventType.DownloadLibrary, { library });
    },
  };
}

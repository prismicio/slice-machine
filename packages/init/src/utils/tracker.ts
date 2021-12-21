/*
 * DUPLICATION
 * this file is a duplication of ServerTracker in sm-ui
 * this duplication has been done on purpose to simplify the merge if init becomes part of sm-ui
 * or if we decide to share the tracker implementation from a lib, but it'll need some refactoring
 * Duplication means no entanglement so don't merge this with the other implem and keep the structure.
 */

import ServerAnalytics from "analytics-node";

export enum EventType {
  DownloadLibrary = "download_library",
}

export class Tracker {
  constructor(
    readonly analytics: ServerAnalytics,
    readonly repo: string,
    readonly identifier: { userId: string } | { anonymousId: string }
  ) {}

  static build(
    writeKey: string,
    repo: string | undefined,
    identifier: { userId: string } | { anonymousId: string }
  ): Tracker | undefined {
    try {
      if (!repo) return;
      const analytics = new ServerAnalytics(writeKey);
      return new Tracker(analytics, repo, identifier);
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  private trackEvent(
    eventType: EventType,
    attributes: Record<string, unknown> = {}
  ): void {
    this.analytics.track({
      event: `slicemachine_${eventType}`,
      ...this.identifier,
      properties: attributes,
    });
  }

  Track = {
    // not called, for demo only
    downloadLibrary: (library: string) => {
      this.trackEvent(EventType.DownloadLibrary, { library });
    },
  };
}

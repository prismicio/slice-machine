import ServerAnalytics from "analytics-node";
import { LibraryUI } from "../../../../lib/models/common/LibraryUI";

// These events should be sync with the tracking Plan on segment.
export enum EventType {
  Demo = "demo_event",
  SignedIn = "Signed In",
  SignedUp = "Signed Up",
}

export class ServerTracker {
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
  ): ServerTracker | undefined {
    try {
      if (!repo) return;
      const analytics = new ServerAnalytics(writeKey);
      return new ServerTracker(analytics, repo, identifier, tracking);
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  private trackEvent(
    eventType: EventType,
    attributes: Record<string, unknown> = {}
  ): void {
    if (this.tracking === false) return void 0;

    this.analytics.track({
      event: eventType,
      ...this.identifier,
      properties: attributes,
    });
  }

  private groupEvent(traits: Record<string, unknown>): void {
    if (this.tracking === false) return void 0;
    this.analytics.group({
      ...this.identifier,
      groupId: this.repo,
      traits,
    });
  }

  Track = {
    // not called, for demo only
    demoEvent: (attribute: string) => {
      this.trackEvent(EventType.Demo, { attribute });
    },
  };

  Group = {
    libraries: (libs: readonly LibraryUI[], smVersion: string) => {
      const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

      this.groupEvent({
        manualLibsCount: libs.filter((l) => l.meta.isManual).length,
        downloadedLibsCount: downloadedLibs.length,
        npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
        downloadedLibs: downloadedLibs.map((l) => l.meta.name || "Unknown"),
        slicemachineVersion: smVersion,
      });
    },
  };

  resolveUser = (userId: string, anonymousId?: string | undefined) => {
    if (!anonymousId) {
      console.log("Missing anonymousId, Unable to resolve user session.");
      return;
    }
    this.analytics.alias({
      userId,
      previousId: anonymousId,
    });
  };
}

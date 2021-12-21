import ServerAnalytics from "analytics-node";
import { LibraryUI } from "../../../../lib/models/common/LibraryUI";

export enum EventType {
  Demo = "demo_event",
}

export class ServerTracker {
  constructor(
    readonly analytics: ServerAnalytics,
    readonly repo: string,
    readonly identifier: { userId: string } | { anonymousId: string }
  ) {}

  static build(
    writeKey: string,
    repo: string | undefined,
    identifier: { userId: string } | { anonymousId: string }
  ): ServerTracker | undefined {
    try {
      if (!repo) return;
      const analytics = new ServerAnalytics(writeKey);
      return new ServerTracker(analytics, repo, identifier);
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

  private groupEvent(traits: Record<string, unknown>): void {
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

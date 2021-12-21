import { createContext } from "react";

import type { Analytics as ClientAnalytics } from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";

export enum EventType {
  Review = "review",
}

export class ClientTracker {
  constructor(readonly analytics: ClientAnalytics, readonly repo: string) {}

  static async build(
    writeKey: string,
    repo: string
  ): Promise<ClientTracker | undefined> {
    try {
      const analytics = await AnalyticsBrowser.standalone(writeKey);
      return new ClientTracker(analytics, repo);
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  private trackEvent(
    eventType: EventType,
    attributes: Record<string, unknown> = {}
  ): void {
    this.analytics
      .track(`slicemachine_${eventType}`, {
        ...attributes,
      })
      .catch(() => console.error(`Couldn't report event ${eventType}`));
  }

  private groupEvent(traits: Record<string, unknown>): void {
    this.analytics.group(this.repo, traits);
  }

  Track = {
    review: (framework: string, rating: number, comment: string) => {
      this.trackEvent(EventType.Review, { rating, comment, framework });
    },
  };

  Group = {
    // for demo only, it's not called
    demoGroup: (demoTraits: Record<string, unknown>) => {
      this.groupEvent(demoTraits);
    },
  };
}

export const TrackerContext = createContext<ClientTracker | undefined>(
  undefined
);

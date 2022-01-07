import { createContext } from "react";

import type { Analytics as ClientAnalytics } from "@segment/analytics-next";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { Frameworks } from "@slicemachine/core/build/src/models";

// These events should be sync with the tracking Plan on segment.
export enum EventType {
  Review = "SliceMachine Review",
  OnboardingStart = "SliceMachine Onboarding Start",
  OnboardingSkip = "SliceMachine Onboarding Skip",
  OnboardingContinueIntro = "SliceMachine Onboarding Continue Screen Intro",
  OnboardingContinueScreen1 = "SliceMachine Onboarding Continue Screen 1",
  OnboardingContinueScreen2 = "SliceMachine Onboarding Continue Screen 2",
  OnboardingContinueScreen3 = "SliceMachine Onboarding Continue Screen 3",
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
      .track(eventType, {
        ...attributes,
      })
      .catch(() => console.error(`Couldn't report event ${eventType}`));
  }

  private groupEvent(traits: Record<string, unknown>): void {
    this.analytics.group(this.repo, traits);
  }

  Track = {
    review: (framework: Frameworks, rating: number, comment: string) => {
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

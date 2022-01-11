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
  // not in sync
  SlicePreviewSetup = "Slice Preview Setup",
  SlicePreview = "Slice Preview",
}

export class ClientTracker {
  constructor(
    readonly analytics: ClientAnalytics,
    readonly repo: string,
    readonly tracking = true
  ) {}

  static async build(
    writeKey: string,
    repo: string,
    tracking = true
  ): Promise<ClientTracker | undefined> {
    try {
      const analytics = await AnalyticsBrowser.standalone(writeKey);
      return new ClientTracker(analytics, repo, tracking);
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
      this.analytics
        .track(eventType, {
          ...attributes,
        })
        .catch(() => console.error(`Couldn't report event ${eventType}`));
  }

  private groupEvent(traits: Record<string, unknown>): void {
    this.tracking && this.analytics.group(this.repo, traits);
  }

  Track = {
    review: (framework: Frameworks, rating: number, comment: string): void => {
      this.trackEvent(EventType.Review, { rating, comment, framework });
    },

    SlicePreviewSetup: (args: { framework: string; version: string }): void => {
      return this.trackEvent(EventType.SlicePreviewSetup, args);
    },

    SlicePreview: (args: { framework: string; version: string }): void => {
      return this.trackEvent(EventType.SlicePreview, args);
    },
  };

  Group = {
    // for demo only, it's not called
    demoGroup: (demoTraits: Record<string, unknown>): void => {
      this.groupEvent(demoTraits);
    },
  };
}

export const TrackerContext = createContext<ClientTracker | undefined>(
  undefined
);

TrackerContext.displayName = "TrackerContext";

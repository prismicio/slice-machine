import "@testing-library/jest-dom";
import { expect, test } from "@jest/globals";
import { AnalyticsBrowser } from "@segment/analytics-next";

import Tracker, { ContinueOnboardingType } from "@src/tracker";
import { Frameworks } from "@slicemachine/core/build/src/models";

jest.mock("@segment/analytics-next", () => {
  return {
    AnalyticsBrowser: {
      standalone: jest.fn().mockReturnThis(),
      track: jest.fn().mockImplementation(() => Promise.resolve()),
      identify: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  };
});

const dumpSegmentKey = "dumpSegmentKey";

describe("tracker", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should init the native client", async () => {
    await Tracker.initialize(dumpSegmentKey);
    // We can do this assertion only as standalone function won't be called on other initialize calls (singleton)
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
  });

  test("should send identify event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.identifyUser("userId");
    expect(AnalyticsBrowser.identify).toHaveBeenCalledTimes(1);
    expect(AnalyticsBrowser.identify).toHaveBeenCalledWith("userId");
  });

  test("should send track review event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackReview(Frameworks.next, 3, "comment");
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith("SliceMachine Review", {
      comment: "comment",
      framework: "next",
      rating: 3,
    });
  });

  test("should send onboarding skip event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackOnboardingSkip(1);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Skip",
      { screenSkipped: 1 }
    );
  });

  test("should send onboarding start event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackOnboardingStart();
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Start",
      {}
    );
  });

  test("should send slice preview setup event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackSlicePreviewSetup(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith("Slice Preview Setup", {
      framework: "next",
      version: "0.2.0",
    });
  });

  test("should send open slice preview event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackOpenSlicePreview(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith("Slice Preview", {
      framework: "next",
      version: "0.2.0",
    });
  });

  test("should send onboarding continue intro event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueIntro
    );
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen Intro",
      {}
    );
  });

  test("should send onboarding continue 1 event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen1
    );
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 1",
      {}
    );
  });

  test("should send onboarding continue 2 event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen2
    );
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 2",
      {}
    );
  });

  test("should send onboarding continue 3 event", async () => {
    await Tracker.initialize(dumpSegmentKey);
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen3
    );
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 3",
      {}
    );
  });

  test("shouldn't send any events when tracker is disable", async () => {
    await Tracker.initialize(dumpSegmentKey, false);
    Tracker.identifyUser("userId");
    Tracker.trackReview(Frameworks.next, 3, "comment");
    Tracker.trackOnboardingSkip(1);
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueIntro
    );
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen1
    );
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen2
    );
    Tracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen3
    );
    Tracker.trackOnboardingStart();
    Tracker.trackOpenSlicePreview(Frameworks.next, "0.2.0");
    Tracker.trackSlicePreviewSetup(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.track).toHaveBeenCalledTimes(0);
    expect(AnalyticsBrowser.identify).toHaveBeenCalledTimes(0);
  });
});

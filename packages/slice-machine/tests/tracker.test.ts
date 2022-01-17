import "@testing-library/jest-dom";
import { expect, test } from "@jest/globals";
import { AnalyticsBrowser } from "@segment/analytics-next";

import TrackerSingleton, {
  ContinueOnboardingType,
  SMTracker,
} from "@src/tracker";
import { Frameworks } from "@slicemachine/core/build/src/models";

jest.mock("@segment/analytics-next", () => {
  return {
    AnalyticsBrowser: {
      standalone: jest.fn().mockReturnThis(),
      track: jest.fn().mockImplementation(() => Promise.resolve()),
      identify: jest.fn().mockImplementation(() => Promise.resolve()),
      group: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  };
});

const dumpSegmentKey = "dumpSegmentKey";
const dumpRepoKey = "dumpSegmentKey";

describe("Tracker Singleton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("should init only one SMTracker instance", async () => {
    const smTracker = TrackerSingleton.get();
    expect(smTracker).toBeInstanceOf(SMTracker);
    const smTracker2 = TrackerSingleton.get();
    expect(smTracker).toBe(smTracker2);
  });
});

describe("SMTracker", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send a identify event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.identifyUser("userId");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.identify).toHaveBeenCalledTimes(1);
    expect(AnalyticsBrowser.identify).toHaveBeenCalledWith("userId");
  });

  test("should send a track review event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackReview(Frameworks.next, 3, "comment");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith("SliceMachine Review", {
      comment: "comment",
      framework: "next",
      rating: 3,
    });
  });

  test("should send a onboarding skip event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackOnboardingSkip(1);
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Skip",
      { screenSkipped: 1 }
    );
  });

  test("should send a onboarding start event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackOnboardingStart();
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Start",
      {}
    );
  });

  test("should send a slice preview setup event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackSlicePreviewSetup(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Slice Preview Setup",
      {
        framework: "next",
        version: "0.2.0",
      }
    );
  });

  test("should send a open slice preview event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackOpenSlicePreview(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Slice Preview Open",
      {
        framework: "next",
        version: "0.2.0",
      }
    );
  });

  test("should send a onboarding continue intro event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueIntro
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen Intro",
      {}
    );
  });

  test("should send a onboarding continue 1 event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen1
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 1",
      {}
    );
  });

  test("should send a onboarding continue 2 event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen2
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 2",
      {}
    );
  });

  test("should send a onboarding continue 3 event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen3
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 3",
      {}
    );
  });

  test("should send a group libraries event", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    smTracker.groupLibraries([], "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.group).toHaveBeenCalledWith(dumpRepoKey, {
      downloadedLibs: [],
      downloadedLibsCount: 0,
      manualLibsCount: 0,
      npmLibsCount: 0,
      slicemachineVersion: "0.2.0",
    });
  });

  test("shouldn't send a group libraries event when the repo is undefined", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey);
    smTracker.groupLibraries([], "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.group).toHaveBeenCalledTimes(0);
  });

  test("shouldn't send any events when tracker is disable", async () => {
    const smTracker = new SMTracker();
    await smTracker.initialize(dumpSegmentKey, dumpRepoKey, false);
    smTracker.identifyUser("userId");
    smTracker.trackReview(Frameworks.next, 3, "comment");
    smTracker.trackOnboardingSkip(1);
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueIntro
    );
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen1
    );
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen2
    );
    smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen3
    );
    smTracker.trackOnboardingStart();
    smTracker.trackOpenSlicePreview(Frameworks.next, "0.2.0");
    smTracker.trackSlicePreviewSetup(Frameworks.next, "0.2.0");
    smTracker.groupLibraries([], "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(AnalyticsBrowser.track).toHaveBeenCalledTimes(0);
    expect(AnalyticsBrowser.identify).toHaveBeenCalledTimes(0);
    expect(AnalyticsBrowser.group).toHaveBeenCalledTimes(0);
  });
});

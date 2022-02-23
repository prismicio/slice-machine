import "@testing-library/jest-dom";

import { expect, test } from "@jest/globals";
import { AnalyticsBrowser } from "@segment/analytics-next";

import TrackerSingleton, {
  ContinueOnboardingType,
  SMTracker,
} from "@src/tracker";
import { Frameworks } from "@slicemachine/core/build/src/models";

jest.mock("@segment/analytics-next");

let NativeTrackerMocks = {
  track: jest.fn().mockImplementation(() => Promise.resolve()),
  identify: jest.fn().mockImplementation(() => Promise.resolve()),
  group: jest.fn().mockImplementation(() => Promise.resolve()),
  page: jest.fn().mockImplementation(() => Promise.resolve()),
};

AnalyticsBrowser.standalone.mockImplementation(() =>
  Promise.resolve(NativeTrackerMocks)
);

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
    smTracker.initialize(dumpSegmentKey);
    await smTracker.identifyUser("userId");

    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.identify).toHaveBeenCalledTimes(1);
    expect(NativeTrackerMocks.identify).toHaveBeenCalledWith("userId");
  });

  test("should send a track review event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey, dumpRepoKey);
    await smTracker.trackReview(Frameworks.next, 3, "comment");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Review",
      {
        comment: "comment",
        framework: "next",
        rating: 3,
      }
    );
  });

  test("should send a onboarding skip event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackOnboardingSkip(1);
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Skip",
      { screenSkipped: 1 }
    );
  });

  test("should send a onboarding start event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackOnboardingStart();
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Start",
      {}
    );
  });

  test("should send a slice preview setup event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackSliceSimulatorSetup(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Slice Simulator Setup",
      {
        framework: "next",
        version: "0.2.0",
      }
    );
  });

  test("should send a open slice preview event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackOpenSliceSimulator(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Slice Simulator Open",
      {
        framework: "next",
        version: "0.2.0",
      }
    );
  });

  test("should send a onboarding continue intro event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueIntro
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen Intro",
      {}
    );
  });

  test("should send a onboarding continue 1 event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen1
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 1",
      {}
    );
  });

  test("should send a onboarding continue 2 event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen2
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 2",
      {}
    );
  });

  test("should send a onboarding continue 3 event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen3
    );
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledWith(
      "SliceMachine Onboarding Continue Screen 3",
      {}
    );
  });

  test("should send a page event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.page(Frameworks.next, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.page).toHaveBeenCalledWith({
      framework: Frameworks.next,
      slicemachineVersion: "0.2.0",
    });
  });

  test("should send a group libraries event", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.groupLibraries([], dumpRepoKey, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.group).toHaveBeenCalledWith({
      repoName: dumpRepoKey,
      downloadedLibs: [],
      downloadedLibsCount: 0,
      manualLibsCount: 0,
      npmLibsCount: 0,
      slicemachineVersion: "0.2.0",
    });
  });

  test("shouldn't send a group libraries event when the repo is undefined", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey);
    await smTracker.groupLibraries([], undefined, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.group).toHaveBeenCalledTimes(0);
  });

  test("shouldn't send any events when tracker is disable", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(dumpSegmentKey, false);
    await smTracker.identifyUser("userId");
    await smTracker.trackReview(Frameworks.next, 3, "comment");
    await smTracker.trackOnboardingSkip(1);
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueIntro
    );
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen1
    );
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen2
    );
    await smTracker.trackOnboardingContinue(
      ContinueOnboardingType.OnboardingContinueScreen3
    );
    await smTracker.page(Frameworks.next, "0.2.0");
    await smTracker.trackOnboardingStart();
    await smTracker.trackOpenSliceSimulator(Frameworks.next, "0.2.0");
    await smTracker.trackSliceSimulatorSetup(Frameworks.next, "0.2.0");
    await smTracker.groupLibraries([], dumpRepoKey, "0.2.0");
    expect(AnalyticsBrowser.standalone).toHaveBeenCalledWith(dumpSegmentKey);
    expect(NativeTrackerMocks.track).toHaveBeenCalledTimes(0);
    expect(NativeTrackerMocks.identify).toHaveBeenCalledTimes(0);
    expect(NativeTrackerMocks.group).toHaveBeenCalledTimes(0);
    expect(NativeTrackerMocks.page).toHaveBeenCalledTimes(0);
  });
});

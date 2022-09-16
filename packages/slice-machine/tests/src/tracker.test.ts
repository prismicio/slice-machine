/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { expect, test } from "@jest/globals";
import TrackerSingleton, { SMTracker } from "@src/tracking/client";
import { EventNames } from "@src/tracking/types";
import { Frameworks } from "@slicemachine/core/build/models";
import { setupServer } from "msw/node";
import { rest, RestContext } from "msw";

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const makeTrackerSpy = () =>
  jest.fn((_req: any, res: any, ctx: RestContext) => {
    return res(ctx.json({}));
  });

const interceptTracker = (spy: ReturnType<typeof makeTrackerSpy>) =>
  server.use(rest.post("/api/s", spy));

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
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);
    await smTracker.identifyUser();
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: EventNames.IdentifyUser,
    });
  });

  test("should send a track review event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackReview(Frameworks.next, 3, "comment");
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Review",
      props: {
        comment: "comment",
        framework: "next",
        rating: 3,
      },
    });
  });

  test("should send a onboarding skip event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackOnboardingSkip(1);
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Onboarding Skip",
      props: { screenSkipped: 1 },
    });
  });

  test("should send a onboarding start event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackOnboardingStart();
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Onboarding Start",
    });
  });

  test("should send a slice preview setup event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackSliceSimulatorSetup(Frameworks.next, "0.2.0");

    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Slice Simulator Setup",
      props: {
        framework: "next",
        version: "0.2.0",
      },
    });
  });

  test("should send a open slice preview event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackOpenSliceSimulator(Frameworks.next, "0.2.0");
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Slice Simulator Open",
      props: {
        framework: "next",
        version: "0.2.0",
      },
    });
  });

  test("should send a onboarding continue intro event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackOnboardingContinue(EventNames.OnboardingContinueIntro);
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Onboarding Continue Screen Intro",
    });
  });

  test("should send a onboarding continue 1 event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen1
    );
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Onboarding Continue Screen 1",
    });
  });

  test("should send a onboarding continue 2 event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen2
    );

    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Onboarding Continue Screen 2",
    });
  });

  test("should send a onboarding continue 3 event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen3
    );
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Onboarding Continue Screen 3",
    });
  });

  test("should send a open video tutorials event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackClickOnVideoTutorials(Frameworks.next, "0.2.0", "foo");
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Open Video Tutorials",
      props: {
        framework: Frameworks.next,
        slicemachineVersion: "0.2.0",
        video: "foo",
      },
    });
  });

  test("should send a page view event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.trackPageView(Frameworks.next, "0.2.0");
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Page View",
      props: {
        framework: Frameworks.next,
        path: "/",
        referrer: "",
        search: "",
        slicemachineVersion: "0.2.0",
        title: "",
        url: "http://localhost/",
      },
    });
  });

  test("should send a group libraries event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);
    const repoName = "wooooooooo";

    await smTracker.groupLibraries([], repoName, "0.2.0");
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: EventNames.GroupLibraries,
      props: {
        repoName,
        downloadedLibs: [],
        downloadedLibsCount: 0,
        manualLibsCount: 0,
        npmLibsCount: 0,
        slicemachineVersion: "0.2.0",
      },
    });
  });

  test("shouldn't send a group libraries event when the repo is undefined", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.groupLibraries([], undefined, "0.2.0");
    expect(trackerSpy).not.toHaveBeenCalled();
  });

  test("it should send a create custom type event", async () => {
    const smTracker = new SMTracker();
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    const id = "test";
    const name = "testing";
    const repeatable = true;
    await smTracker.trackCreateCustomType({ id, name, repeatable });
    expect(trackerSpy).toHaveBeenCalled();
    expect(trackerSpy.mock.calls[0][0].body).toEqual({
      name: "SliceMachine Custom Type Created",
      props: {
        id,
        name,
        type: "repeatable",
      },
    });
  });

  test("shouldn't send any events when tracker is disable", async () => {
    const smTracker = new SMTracker();
    smTracker.initialize(false);
    const trackerSpy = makeTrackerSpy();
    interceptTracker(trackerSpy);

    await smTracker.identifyUser("userId", "intercomhash");
    await smTracker.trackReview(Frameworks.next, 3, "comment");
    await smTracker.trackOnboardingSkip(1);
    await smTracker.trackOnboardingContinue(EventNames.OnboardingContinueIntro);
    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen1
    );
    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen2
    );
    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen3
    );
    await smTracker.trackClickOnVideoTutorials(Frameworks.next, "0.2.0");
    await smTracker.trackPageView(Frameworks.next, "0.2.0");
    await smTracker.trackOnboardingStart();
    await smTracker.trackOpenSliceSimulator(Frameworks.next, "0.2.0");
    await smTracker.trackSliceSimulatorSetup(Frameworks.next, "0.2.0");
    await smTracker.groupLibraries([], "repoName", "0.2.0");
    expect(trackerSpy).not.toHaveBeenCalled();
  });
});

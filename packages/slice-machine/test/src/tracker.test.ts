// @vitest-environment jsdom

import { describe, test, afterEach, expect, vi } from "vitest";
import TrackerSingleton, { SMTracker } from "@src/tracking/client";
import { EventNames } from "@lib/models/tracking";
import { Frameworks } from "@lib/models/common/Framework";
import { rest } from "msw";

describe("Tracker Singleton", () => {
  afterEach(() => {
    vi.clearAllMocks();
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
    vi.clearAllMocks();
  });

  test("should send a identify event", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();
    await smTracker.identifyUser();
    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: EventNames.IdentifyUser,
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });

  test("should send a onboarding continue intro event", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();

    await smTracker.trackOnboardingContinue(EventNames.OnboardingContinueIntro);
    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: "SliceMachine Onboarding Continue Screen Intro",
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });

  test("should send a onboarding continue 1 event", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();

    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen1
    );
    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: "SliceMachine Onboarding Continue Screen 1",
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });

  test("should send a onboarding continue 2 event", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();

    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen2
    );

    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: "SliceMachine Onboarding Continue Screen 2",
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });

  test("should send a onboarding continue 3 event", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();

    await smTracker.trackOnboardingContinue(
      EventNames.OnboardingContinueScreen3
    );
    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: "SliceMachine Onboarding Continue Screen 3",
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });

  test("should send a open video tutorials event", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();

    await smTracker.trackClickOnVideoTutorials(Frameworks.next, "0.2.0", "foo");
    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: "SliceMachine Open Video Tutorials",
          props: {
            framework: Frameworks.next,
            slicemachineVersion: "0.2.0",
            video: "foo",
          },
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });

  test("should send a group libraries event", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();
    const repoName = "wooooooooo";

    await smTracker.groupLibraries([], repoName, "0.2.0");
    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: EventNames.GroupLibraries,
          props: {
            repoName,
            downloadedLibs: [],
            downloadedLibsCount: 0,
            manualLibsCount: 0,
            npmLibsCount: 0,
            slicemachineVersion: "0.2.0",
          },
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });

  test("shouldn't send a group libraries event when the repo is undefined", async (ctx) => {
    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

    const smTracker = new SMTracker();

    await smTracker.groupLibraries([], undefined, "0.2.0");
    expect(trackingSpy).not.toHaveBeenCalled();
  });
});

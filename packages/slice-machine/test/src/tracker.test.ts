// @vitest-environment jsdom

import { describe, test, afterEach, expect, vi } from "vitest";
import TrackerSingleton, { SMTracker } from "@src/tracking/client";
import { EventNames } from "@lib/models/tracking";
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

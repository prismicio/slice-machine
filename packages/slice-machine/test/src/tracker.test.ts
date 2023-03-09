// @vitest-environment jsdom

import { describe, test, afterEach, expect, vi } from "vitest";
import TrackerSingleton, { SMTracker } from "@src/tracking/client";

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

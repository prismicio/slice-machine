import { describe, it, expect } from "vitest";
import { getScaling } from "@components/Simulator/components/IframeRenderer";

const VIEWPORT_SIZE = { width: 100, height: 100 };

describe("getScaling", () => {
  it("prevents the iframe from overflowing the viewport", () => {
    expect(getScaling({ width: 50, height: 50 }, VIEWPORT_SIZE)).toBe(1);
    expect(getScaling({ width: 200, height: 50 }, VIEWPORT_SIZE)).toBe(0.5);
    expect(getScaling({ width: 200, height: 150 }, VIEWPORT_SIZE)).toBe(0.5);
    expect(getScaling({ width: 50, height: 200 }, VIEWPORT_SIZE)).toBe(0.5);
    expect(getScaling({ width: 150, height: 200 }, VIEWPORT_SIZE)).toBe(0.5);
    expect(getScaling({ width: 200, height: 200 }, VIEWPORT_SIZE)).toBe(0.5);
  });
});

import { describe, expect, it } from "vitest";

import { addImgixDisplayParams } from "../imgix";

describe("addImgixDisplayParams", () => {
  it("adds resize + format params to an Imgix https URL", () => {
    const result = addImgixDisplayParams(
      "https://prismic-io.imgix.net/repo/screenshot.png",
      { width: 600 },
    );

    const url = new URL(result as string);
    expect(url.searchParams.get("w")).toBe("600");
    expect(url.searchParams.get("fit")).toBe("max");
    expect(url.searchParams.get("auto")).toBe("format,compress");
    // Never sets a height, so Imgix keeps the aspect ratio.
    expect(url.searchParams.has("h")).toBe(false);
  });

  it("works with plain http Imgix URLs", () => {
    const result = addImgixDisplayParams(
      "http://prismic-io.imgix.net/repo/screenshot.png",
      { width: 1200 },
    );

    const url = new URL(result as string);
    expect(url.searchParams.get("w")).toBe("1200");
    expect(url.hostname).toBe("prismic-io.imgix.net");
  });

  it("overrides a pre-existing `auto` param", () => {
    const result = addImgixDisplayParams(
      "https://prismic-io.imgix.net/repo/screenshot.png?auto=compress,format",
      { width: 600 },
    );

    const url = new URL(result as string);
    // Only the new value remains, not the original `compress,format`.
    expect(url.searchParams.getAll("auto")).toEqual(["format,compress"]);
  });

  it("returns blob: URLs unchanged", () => {
    const input = "blob:http://localhost:9999/abcdef-123456";
    expect(addImgixDisplayParams(input, { width: 600 })).toBe(input);
  });

  it("returns data: URLs unchanged", () => {
    const input = "data:image/png;base64,iVBORw0KGgo=";
    expect(addImgixDisplayParams(input, { width: 600 })).toBe(input);
  });

  it("returns relative / unparseable strings unchanged", () => {
    expect(addImgixDisplayParams("/local/screenshot.png", { width: 600 })).toBe(
      "/local/screenshot.png",
    );
    expect(addImgixDisplayParams("not a url", { width: 600 })).toBe(
      "not a url",
    );
  });

  it("returns non-Imgix hosts unchanged", () => {
    const input = "https://example.com/repo/screenshot.png";
    expect(addImgixDisplayParams(input, { width: 600 })).toBe(input);
  });

  it("returns undefined when given undefined", () => {
    expect(addImgixDisplayParams(undefined, { width: 600 })).toBeUndefined();
  });

  it("returns an empty string unchanged", () => {
    expect(addImgixDisplayParams("", { width: 600 })).toBe("");
  });
});

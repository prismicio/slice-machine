import { describe, expect, test, afterEach, vi } from "vitest";
import { maybeRepoNameFromSMFile } from "../../../core/node-utils/manifest";

import fs from "node:fs";

describe("maybeRepoNameFromSMFile", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  vi.spyOn(console, "log").mockImplementationOnce(() => undefined);

  test("should return null if sm.json is not found", () => {
    vi.spyOn(fs, "lstatSync").mockImplementationOnce(() => undefined);
    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if apiEndpoint is not defined", () => {
    vi.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({}));

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if sm.json is unreadable", () => {
    vi.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(
      "fake value that isn't a regular json"
    );

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if apiEndpoint is malformed", () => {
    vi.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({ apiEndpoint: "fake value that is not a valid url" })
    );

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if apiEndpoint is on a different base", () => {
    const fakeConfig = { apiEndpoint: "https://example.com" };

    vi.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify(fakeConfig)
    );

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return the repo name from the apiEdinpoint", () => {
    const fakeConfig = { apiEndpoint: "https://foo-bar.prismic.io/api/v2" };

    vi.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify(fakeConfig)
    );

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBe("foo-bar");
  });
});

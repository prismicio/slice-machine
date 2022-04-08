import { describe, expect, test, afterEach, jest } from "@jest/globals";
import { maybeRepoNameFromSMFile } from "../../src/node-utils/manifest";

import fs from "fs";

describe("maybeRepoNameFromSMFile", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  jest.spyOn(console, "log").mockImplementationOnce(() => undefined);

  test("should return null if sm.json is not found", () => {
    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => undefined);
    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if apiEndpoint is not defined", () => {
    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify({}));

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if sm.json is unreadable", () => {
    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce("fake value that isn't a regular json");

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if apiEndpoint is malformed", () => {
    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(
        JSON.stringify({ apiEndpoint: "fake value that is not a valid url" })
      );

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return null if apiEndpoint is on a different base", () => {
    const fakeConfig = { apiEndpoint: "https://example.com" };

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeConfig));

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBeNull();
  });

  test("should return the repo name from the apiEdinpoint", () => {
    const fakeConfig = { apiEndpoint: "https://foo-bar.prismic.io/api/v2" };

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(fakeConfig));

    const result = maybeRepoNameFromSMFile(__dirname, "https://prismic.io");
    expect(result).toBe("foo-bar");
  });
});

import { describe, expect, test, afterEach, jest } from "@jest/globals";
import {
  maybeRepoNameFromSMFile,
  createOrUpdateManifest,
} from "../../src/node-utils/manifest";

import fs from "fs";
import os from "os";
import path from "path";
import * as Models from "../../src/models";

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

interface FsError extends Error {
  code: string;
}

describe("#createOrUpdate", () => {
  test("when there is no mainfest it should create a new one", () => {
    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => {
      const e = new Error() as FsError;
      e.code = "ENOENT";
      throw e;
    });

    const writeSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementationOnce(() => undefined);

    const data = {
      apiEndpoint: "https://example.prismic.io/api/v2",
      framework: Models.Frameworks.next,
    };

    const tmp = os.tmpdir();

    createOrUpdateManifest(tmp, data);

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy).toHaveBeenLastCalledWith(
      path.join(tmp, "sm.json"),
      JSON.stringify(data, null, 2),
      "utf8"
    );
  });

  test("when there is a manifest it should update the manifest", () => {
    const tmp = os.tmpdir();
    const currentConfig = {
      apiEndpoint: "https://example.prismic.io/api/v2",
      framework: Models.Frameworks.next,
    };
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValueOnce(JSON.stringify(currentConfig));

    const configUpdate = { apiEndpoint: "https://marc.prismic.io/api/v2" };

    const expected = { ...currentConfig, ...configUpdate };

    const writeSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementationOnce(() => undefined);

    createOrUpdateManifest(tmp, configUpdate);

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy).toHaveBeenLastCalledWith(
      path.join(tmp, "sm.json"),
      JSON.stringify(expected, null, 2),
      "utf8"
    );
  });
});

import {
  checkVersion,
  hasYarn,
  getRemotePackage,
  HTTPResponseError,
} from "../../../lib/utils/version";
import fs from "fs";
import nock from "nock";
import semver from "semver";
import { name, version } from "../../../package.json";

describe("version", () => {
  describe("checkVersion", () => {
    test("with same remote version", async () => {
      nock("https://unpkg.com")
        .get(`/${name}/package.json`)
        .reply(200, { version });

      const result = await checkVersion();
      expect(result.update).toBe(false);
    });

    test("with lower remote version", async () => {
      nock("https://unpkg.com")
        .get(`/${name}/package.json`)
        .reply(200, { version: "0.0.0" });

      const result = await checkVersion();
      expect(result.update).toBe(false);
    });

    test("with higher remote version", async () => {
      nock("https://unpkg.com")
        .get(`/${name}/package.json`)
        .reply(200, { version: semver.inc(version, "patch") });

      const result = await checkVersion();
      expect(result.update).toBe(true);
    });
  });

  describe("hasYarn", () => {
    test("it should return true if the project uses yarn", () => {
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      const result = hasYarn();
      expect(result).toBe(true);
    });

    test("it should return false if the project does not use yarn", () => {
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(false);
      const result = hasYarn();
      expect(result).toBe(false);
    });
  });

  describe("getRemotePackage", () => {
    test("should throw an error if a non success code is returned", async () => {
      nock("https://unpkg.com")
        .get(`/${name}/package.json`)
        .reply(300, { version: "0.0.0" });

      await expect(() => getRemotePackage()).rejects.toThrow(HTTPResponseError);
    });
  });
});

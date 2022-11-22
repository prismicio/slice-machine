/**
 * @jest-environment node
 */

import {
  findPackageVersions,
  findLatestNonBreakingUpdate,
  isUpdateAvailable,
} from "../../../lib/env/versions";
import nock from "nock";
import { VersionKind } from "@models/common/versions";

describe("findPackageVersions", () => {
  afterEach(() => {
    nock.cleanAll();
  });
  test("it should return the version above 0.1.0 without non stable version", async () => {
    const versions = [
      "0.0.42",
      "1.0.1",
      "1.2.1",
      "1.2.2",
      "2.2.1",
      "3.0.0-alpha.0",
    ];

    // fetching npm versions
    nock("https://registry.npmjs.org")
      .get("/slice-machine-ui")
      .reply(200, {
        name: "foo",
        versions: versions.reduce(
          (acc, curr) => ({ ...acc, [curr]: null }),
          {}
        ),
      });

    // fetching release notes
    nock("https://api.github.com")
      .get("/repos/prismicio/slice-machine/releases")
      .reply(200, [
        {
          name: "2.2.1",
          draft: false,
          body: "releaseNote 2.2.1",
        },
      ]);

    const result = await findPackageVersions("slice-machine-ui");
    expect(result).toEqual([
      {
        versionNumber: "2.2.1",
        releaseNote: "releaseNote 2.2.1",
        kind: VersionKind.MAJOR,
      },
      {
        versionNumber: "1.2.2",
        releaseNote: null,
        kind: VersionKind.PATCH,
      },
      {
        versionNumber: "1.2.1",
        releaseNote: null,
        kind: VersionKind.MINOR,
      },
      {
        versionNumber: "1.0.1",
        releaseNote: null,
        kind: null,
      },
    ]);
  });

  test("it should not throw if we can't retrieve Github release notes", async () => {
    const versions = [
      "0.0.42",
      "1.0.1",
      "1.2.1",
      "1.2.2",
      "2.2.1",
      "3.0.0-alpha.0",
    ];

    jest.spyOn(console, "log").mockImplementation(() => null);

    // fetching npm versions
    nock("https://registry.npmjs.org")
      .get("/slice-machine-ui")
      .reply(200, {
        name: "foo",
        versions: versions.reduce(
          (acc, curr) => ({ ...acc, [curr]: null }),
          {}
        ),
      });

    // fetching release notes
    nock("https://api.github.com")
      .get("/repos/prismicio/slice-machine/releases")
      .reply(500);

    const result = await findPackageVersions("slice-machine-ui");
    expect(result).toEqual([
      {
        versionNumber: "2.2.1",
        releaseNote: null,
        kind: VersionKind.MAJOR,
      },
      {
        versionNumber: "1.2.2",
        releaseNote: null,
        kind: VersionKind.PATCH,
      },
      {
        versionNumber: "1.2.1",
        releaseNote: null,
        kind: VersionKind.MINOR,
      },
      {
        versionNumber: "1.0.1",
        releaseNote: null,
        kind: null,
      },
    ]);
  });

  test("it should to now throw if we can't retrieve Npm list of versions", async () => {
    jest.spyOn(console, "log").mockImplementation(() => null);

    // fetching npm versions
    nock("https://registry.npmjs.org")
      .get("/slice-machine-ui")
      .reply(500, "error Mocking Npm Release");

    const result = await findPackageVersions("slice-machine-ui");
    expect(result).toEqual([]);
  });
});

describe("findLatestNonBreakingUpdate", () => {
  it("should find the latest non breaking update from the list (minor case)", () => {
    const versions = [
      { versionNumber: "0.0.42", releaseNote: null },
      { versionNumber: "1.0.1", releaseNote: null },
      { versionNumber: "1.2.3", releaseNote: null },
      { versionNumber: "2.2.1", releaseNote: null },
      { versionNumber: "3.0.0-alpha.0", releaseNote: null },
    ];
    const currentVersion = "1.0.1";

    const result = findLatestNonBreakingUpdate(currentVersion, versions);
    expect(result).toBe("1.2.3");
  });

  it("should find the latest non breaking update from the list (patch case)", () => {
    const versions = [
      { versionNumber: "0.0.42", releaseNote: null },
      { versionNumber: "1.0.1", releaseNote: null },
      { versionNumber: "1.0.3", releaseNote: null },
      { versionNumber: "2.2.1", releaseNote: null },
      { versionNumber: "3.0.0-alpha.0", releaseNote: null },
    ];
    const currentVersion = "1.0.1";

    const result = findLatestNonBreakingUpdate(currentVersion, versions);
    expect(result).toBe("1.0.3");
  });

  it("should not find a latest non breaking update from the list", () => {
    const versions = [
      { versionNumber: "0.0.42", releaseNote: null },
      { versionNumber: "1.0.1", releaseNote: null },
      { versionNumber: "2.2.1", releaseNote: null },
      { versionNumber: "3.0.0-alpha.0", releaseNote: null },
    ];
    const currentVersion = "1.0.1";

    const result = findLatestNonBreakingUpdate(currentVersion, versions);
    expect(result).toBe(null);
  });
});

describe("isUpdateAvailable", () => {
  it("should find an update from the list (major case)", () => {
    const versions = [
      { versionNumber: "0.0.42", releaseNote: null },
      { versionNumber: "1.0.1", releaseNote: null },
      { versionNumber: "2.1.0", releaseNote: null },
      { versionNumber: "2.2.1", releaseNote: null },
      { versionNumber: "3.0.0-alpha.0", releaseNote: null },
    ];
    const currentVersion = "1.0.1";

    const result = isUpdateAvailable(currentVersion, versions);
    expect(result).toBeTruthy();
  });

  it("should find an update from the list (minor case)", () => {
    const versions = [
      { versionNumber: "0.0.42", releaseNote: null },
      { versionNumber: "1.0.1", releaseNote: null },
      { versionNumber: "1.2.3", releaseNote: null },
      { versionNumber: "2.2.1", releaseNote: null },
      { versionNumber: "3.0.0-alpha.0", releaseNote: null },
    ];
    const currentVersion = "1.0.1";

    const result = isUpdateAvailable(currentVersion, versions);
    expect(result).toBeTruthy();
  });

  it("should find an update from the list (patch case)", () => {
    const versions = [
      { versionNumber: "0.0.42", releaseNote: null },
      { versionNumber: "1.0.1", releaseNote: null },
      { versionNumber: "1.0.3", releaseNote: null },
      { versionNumber: "2.2.1", releaseNote: null },
      { versionNumber: "3.0.0-alpha.0", releaseNote: null },
    ];
    const currentVersion = "1.0.1";

    const result = isUpdateAvailable(currentVersion, versions);
    expect(result).toBeTruthy();
  });

  it("should not find a latest non breaking update from the list", () => {
    const versions = [
      { versionNumber: "0.0.42", releaseNote: null },
      { versionNumber: "1.0.1", releaseNote: null },
      { versionNumber: "2.2.1", releaseNote: null },
      { versionNumber: "3.0.0-alpha.0", releaseNote: null },
    ];
    const currentVersion = "2.2.1";

    const result = findLatestNonBreakingUpdate(currentVersion, versions);
    expect(result).toBeFalsy();
  });
});

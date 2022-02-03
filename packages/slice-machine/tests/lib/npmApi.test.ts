import {
  fetchVersions,
  whatSortOfVersions,
  getAvailableVersionInfo,
} from "../../lib/env/npmApi";
import nock from "nock";

describe("fetchVersions", () => {
  test("when given a package name it should fetch package info form npm and return an array of versions", async () => {
    const expected = ["0.0.0", "0.0.1", "0.1.0", "1.0.0"];
    nock("https://registry.npmjs.org")
      .get("/slice-machine-ui")
      .reply(200, {
        name: "foo",
        versions: expected.reduce(
          (acc, curr) => ({ ...acc, [curr]: null }),
          {}
        ),
      });
    const result = await fetchVersions("slice-machine-ui");
    expect(result).toEqual(expected);
  });

  test("when no versions in response it returns an empty array", async () => {
    nock("https://registry.npmjs.org").get("/slice-machine-ui").reply(200, {
      name: "foo",
    });
    const result = await fetchVersions("slice-machine-ui");
    expect(result).toEqual([]);
  });

  test("when it fails it should return an empty array", async () => {
    nock("https://registry.npmjs.org").get("/slice-machine-ui").reply(500);
    const result = await fetchVersions("slice-machine-ui");
    expect(result).toEqual([]);
  });
});

describe("whatSortOfVersions", () => {
  test("when given an empty array of versions it should return empty strings for patch, minor and major", () => {
    const want = { patch: "", minor: "", major: "" };
    const got = whatSortOfVersions("0.0.0", []);
    expect(got).toEqual(want);
  });

  test("when versions that contains a patch it should return the patch version", () => {
    const want = { patch: "0.0.1", minor: "", major: "" };
    const got = whatSortOfVersions("0.0.0", ["0.0.0", "0.0.1"]);
    expect(got).toEqual(want);
  });

  test("when versions contains two patches it should return the highest patch version", () => {
    const want = { patch: "0.0.2", minor: "", major: "" };
    const got = whatSortOfVersions("0.0.0", ["0.0.0", "0.0.1", "0.0.2"]);
    expect(got).toEqual(want);
  });

  test("when versions contains a minor version it should return the highest minor version", () => {
    const want = { patch: "", minor: "0.1.0", major: "" };
    const got = whatSortOfVersions("0.0.0", [
      "0.0.0",
      "0.1.0",
      "0.2.0-alpha.1",
    ]);
    expect(got).toEqual(want);
  });

  test("when versions contains a minor version it should return the highest minor version", () => {
    const want = { patch: "", minor: "0.2.1", major: "" };
    const got = whatSortOfVersions("0.0.0", [
      "0.0.0",
      "0.1.0",
      "0.2.1",
      "0.2.0",
    ]);
    expect(got).toEqual(want);
  });

  test("when versions contain major versions it should return the highest major version", () => {
    const want = { patch: "", minor: "", major: "2.2.2" };
    const got = whatSortOfVersions("1.0.0", [
      "0.5.9",
      "1.0.0",
      "1.2.2-alpha.0",
      "2.0.0",
      "2.2.2",
    ]);
    expect(got).toEqual(want);
  });

  test("versions contains patches, minor and major versions", () => {
    const want = { patch: "1.0.2", minor: "1.1.1", major: "2.1.2" };
    const versions = [
      "0.0.0",
      "0.9.9",
      "1.0.0",
      "1.0.1",
      "1.1.1",
      "1.1.0",
      "1.0.2",
      "2.0.9-alpha.0",
      "2.1.2",
      "2.0.0",
      "2.1.0",
    ];

    const got = whatSortOfVersions("1.0.1", versions);

    expect(got).toEqual(want);
  });
});

describe("getAvailableVersionInfo", () => {
  test("it should return the highest available patches, minor and major versions", async () => {
    const current = "1.0.1";
    const patch = "1.0.2";
    const minor = "1.2.2";
    const major = "2.2.2";

    const versions = [
      current,
      patch,
      minor,
      major,
      "0.0.0",
      "0.0.9",
      "0.9.0",
      "1.0.0",
      "1.0.1",
      "1.0.2-alpha.2",
      "1.1.1",
      "1.2.0",
      "1.3.0-alpha.0",
      "2.1.0",
      "2.2.1",
      "3.0.0-alpha.0",
    ];
    nock("https://registry.npmjs.org")
      .get("/slice-machine-ui")
      .reply(200, {
        name: "foo",
        versions: versions.reduce(
          (acc, curr) => ({ ...acc, [curr]: null }),
          {}
        ),
      });

    const result = await getAvailableVersionInfo("slice-machine-ui", current);
    expect(result).toEqual({ patch, minor, major });
  });
});

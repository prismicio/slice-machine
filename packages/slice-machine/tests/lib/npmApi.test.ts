import { fetchVersions, semverVersions } from "../../lib/env/npmApi";
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

describe("semverVersions", function () {
  const result = semverVersions("0.2.1", ["0.2.1", "0.1.2", "0.0.2", "1.2.3"]);
  expect(result).toEqual([]);
});

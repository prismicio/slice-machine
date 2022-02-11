import { findPackageVersions } from "../../../lib/env/versions";
import nock from "nock";

describe("findPackageVersions", () => {
  test("it should return the version above 0.1.0 without non stable version", async () => {
    const versions = ["0.0.42", "1.0.1", "2.2.1", "3.0.0-alpha.0"];
    nock("https://registry.npmjs.org")
      .get("/slice-machine-ui")
      .reply(200, {
        name: "foo",
        versions: versions.reduce(
          (acc, curr) => ({ ...acc, [curr]: null }),
          {}
        ),
      });

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
        version: "2.2.1",
        releaseNote: "releaseNote 2.2.1",
      },
      {
        version: "1.0.1",
        releaseNote: null,
      },
    ]);
  });
});

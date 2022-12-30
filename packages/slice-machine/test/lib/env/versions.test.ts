import { describe, test, expect, it, vi } from "vitest";
import {
  findPackageVersions,
  findLatestNonBreakingUpdate,
  isUpdateAvailable,
} from "../../../lib/env/versions";
import { VersionKind } from "@models/common/versions";
import { rest } from "msw";

describe("findPackageVersions", () => {
  test("it should return the version above 0.1.0 without non stable version", async (ctx) => {
    const versions = [
      "0.0.42",
      "1.0.1",
      "1.2.1",
      "1.2.2",
      "2.2.1",
      "3.0.0-alpha.0",
    ];

    // fetching npm versions
    ctx.msw.use(
      rest.get(
        "https://registry.npmjs.org/slice-machine-ui",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              name: "foo",
              versions: versions.reduce(
                (acc, curr) => ({ ...acc, [curr]: null }),
                {}
              ),
            })
          );
        }
      )
    );

    // fetching release notes
    ctx.msw.use(
      rest.get(
        "https://api.github.com/repos/prismicio/slice-machine/releases",
        (_req, res, ctx) => {
          return res(
            ctx.json([
              {
                name: "2.2.1",
                draft: false,
                body: "releaseNote 2.2.1",
              },
            ])
          );
        }
      )
    );

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

  test("it should not throw if we can't retrieve Github release notes", async (ctx) => {
    const versions = [
      "0.0.42",
      "1.0.1",
      "1.2.1",
      "1.2.2",
      "2.2.1",
      "3.0.0-alpha.0",
    ];

    vi.spyOn(console, "log").mockImplementation(() => null);

    // fetching npm versions
    ctx.msw.use(
      rest.get(
        "https://registry.npmjs.org/slice-machine-ui",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              name: "foo",
              versions: versions.reduce(
                (acc, curr) => ({ ...acc, [curr]: null }),
                {}
              ),
            })
          );
        }
      )
    );

    // fetching release notes
    ctx.msw.use(
      rest.get(
        "https://api.github.com/repos/prismicio/slice-machine/releases",
        (_req, res, ctx) => {
          return res(ctx.status(500));
        }
      )
    );

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

  test("it should to now throw if we can't retrieve Npm list of versions", async (ctx) => {
    vi.spyOn(console, "log").mockImplementation(() => null);

    // fetching npm versions
    ctx.msw.use(
      rest.get(
        "https://registry.npmjs.org/slice-machine-ui",
        (_req, res, ctx) => {
          return res(ctx.status(500), ctx.text("error Mocking Npm Release"));
        }
      )
    );

    // fetching release notes
    ctx.msw.use(
      rest.get(
        "https://api.github.com/repos/prismicio/slice-machine/releases",
        (_req, res, ctx) => {
          return res(ctx.json([]));
        }
      )
    );

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

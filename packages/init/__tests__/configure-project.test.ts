import { fs, vol } from "memfs";
import path from "path";
import { jest, afterEach, expect, describe, test } from "@jest/globals";
import * as Core from "@slicemachine/core";
import { configureProject } from "../src/steps";
import { Manifest } from "@slicemachine/core/src/models";

const TMP = "/tmp";

const realProcess = process;
const exitMock = jest.fn() as (code?: number) => never;
global.process = { ...realProcess, exit: exitMock };

jest.spyOn(console, "error").mockImplementationOnce(() => null);

jest.mock(`fs`, () => {
  return vol;
});

afterEach(() => {
  vol.reset();
});

const BASE = "https://music.to.my.hears.io";
const REPO = "testing-repo";
const MAN = {
  value: Core.Models.Frameworks.react,
  manuallyAdded: false,
};
const EXPECTED_REPO = "https://testing-repo.music.to.my.hears.io/api/v2";

describe("configure-project", () => {
  test("it should create a new manifest if it doesn't exist yet", () => {
    vol.fromJSON(
      {
        "file.txt": "content",
      },
      TMP
    );
    configureProject(TMP, BASE, REPO, MAN);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(TMP, "sm.json"), "utf-8") as string
    ) as Manifest;
    expect(manifest.apiEndpoint).toBe(EXPECTED_REPO);
    expect(manifest.libraries).toContain("@/slices");
  });

  test("it should fail if retrieve manifest throws", () => {
    vol.fromJSON(
      {
        "sm.json": "{'key': VALUE }",
      },
      TMP
    );
    configureProject(TMP, BASE, REPO, MAN);
    expect(exitMock).toHaveBeenCalledWith(-1);
  });
  test("it should patch the existing manifest", () => {
    vol.fromJSON(
      {
        "sm.json": `{"chromaticAppId": "VALUE" }`,
      },
      TMP
    );
    configureProject(TMP, BASE, REPO, MAN);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(TMP, "sm.json"), "utf-8") as string
    ) as Manifest;
    expect(manifest.apiEndpoint).toBe(EXPECTED_REPO);
    expect(manifest.libraries).toContain("@/slices");
    expect(manifest.chromaticAppId).toContain("VALUE");
  });
});

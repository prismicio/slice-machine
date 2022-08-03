import { describe, test, afterEach, expect } from "@jest/globals";
import { setVersion } from "../src/steps/set-version";
import mockfs from "mock-fs";
import os from "os";
import path from "path";
import fs from "fs";

const TMP_DIR = path.join(os.tmpdir(), "init-version");

describe("set-version", () => {
  afterEach(() => {
    mockfs.restore();
  });

  test("it should not set _latest in sm.json if it is already defined", () => {
    mockfs({
      [TMP_DIR]: {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.prismic.io",
          _latest: "0.0.1",
        }),
        "package.json": JSON.stringify({
          devDependencies: { "slice-machine-ui": "5.0.0" },
        }),
      },
    });

    setVersion(TMP_DIR);

    const smJson = JSON.parse(
      fs.readFileSync(path.join(TMP_DIR, "sm.json"), "utf-8")
    ) as unknown as { _latest?: string };
    expect(smJson._latest).toEqual("0.0.1");
  });

  test("it should set _latest in sm.json to the installed version of slice-machine-ui", () => {
    mockfs({
      [TMP_DIR]: {
        "sm.json": JSON.stringify({
          apiEndpoint: "https://foo-bar.prismic.io",
        }),
        "package.json": JSON.stringify({
          devDependencies: { "slice-machine-ui": "5.0.0" },
        }),
      },
    });

    setVersion(TMP_DIR);

    const smJson = JSON.parse(
      fs.readFileSync(path.join(TMP_DIR, "sm.json"), "utf-8")
    ) as unknown as { _latest?: string };
    expect(smJson._latest).toEqual("5.0.0");
  });
});

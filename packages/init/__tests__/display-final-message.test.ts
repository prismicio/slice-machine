import { describe, test, afterEach, expect, beforeAll } from "@jest/globals";
import path from "path";
import mockfs from "mock-fs";
import os from "os";
import { stdout } from "stdout-stderr";
import { displayFinalMessage } from "../src/steps";

const TMP_DIR = path.join(os.tmpdir(), "init-display-final-message");

const FAKE_BASE = "https://prismic.io";
const FAKE_REPO = "foo";

describe("display final message", () => {
  beforeAll(() => {
    stdout.stripColor = true;
  });

  afterEach(() => {
    mockfs.restore();
  });

  test("when not using a starter and not using yarn", () => {
    stdout.start();
    displayFinalMessage(TMP_DIR, false, FAKE_REPO, FAKE_BASE);
    stdout.stop();
    expect(stdout.output).toContain(
      "■ Run npm run slicemachine to launch Slice Machine and create your first Custom Type"
    );
  });

  test("when not using a starter but using yarn", () => {
    mockfs({
      [TMP_DIR]: {
        "yarn.lock": JSON.stringify({}),
      },
    });

    stdout.start();
    displayFinalMessage(TMP_DIR, false, FAKE_REPO, FAKE_BASE);
    stdout.stop();
    expect(stdout.output).toContain(
      "■ Run yarn run slicemachine to launch Slice Machine and create your first Custom Type"
    );
  });

  test("when wasStarter is set to true", () => {
    stdout.start();
    displayFinalMessage(TMP_DIR, true, FAKE_REPO, FAKE_BASE);
    stdout.stop();

    expect(stdout.output).toContain(
      "Start editing your content in Prismic https://foo.prismic.io"
    );
  });
});

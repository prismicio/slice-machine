import { describe, test, afterEach, expect } from "@jest/globals";
import npath from "path";
import { sendStarterData } from "../src/steps";
import nock from "nock";
import mockfs from "mock-fs";
import os from "os";
import mock from "mock-fs";

const TMP_DIR = npath.join(os.tmpdir(), "sm-init-starter-test");

const token = "aaaaaaa";
const repo = "bbbbbbb";
const base = "https://prismic.io";
const cookies = `prismic-auth=${token}`;

describe("send starter data", () => {
  afterEach(() => {
    mock.restore();
    nock.cleanAll();
  });

  test("it should do nothing when there is no documents directory", async () => {
    mockfs({
      [TMP_DIR]: {},
    });

    const result = await sendStarterData(repo, base, cookies, TMP_DIR);
    expect(result).toBeFalsy();
  });
});

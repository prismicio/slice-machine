/* Pretty important feature not to have a test */
import {
  describe,
  expect,
  test,
  jest,
  afterEach,
  beforeEach,
} from "@jest/globals";
import nock from "nock";
import { installLib } from "../src/steps/install-lib";
import { stderr } from "stdout-stderr";
import path from "path";
import os from "os";
import fs from "fs";
import AdmZip from "adm-zip";
import child_process from "child_process";

describe("install-lib", () => {
  const fakeCWD = path.join(os.tmpdir(), "install-lib-test");

  afterEach(() => {
    jest.clearAllMocks();
    nock.restore();
  });

  beforeEach(() => {
    if (fs.existsSync(fakeCWD)) {
      fs.rmSync(fakeCWD, { recursive: true, force: true });
    }
    fs.mkdirSync(fakeCWD, { recursive: true });
  });

  test("downloads zip form the main branch from github", async () => {
    const user = "prismicio";
    const project = "foo";
    const gitpath = path.posix.join(user, project);
    const branch = "main";

    const Theme = new AdmZip();
    const themePath = path.join(__dirname, "__stubs__", "fake-project");

    Theme.addLocalFolder(themePath, `${project}-${branch}`);

    const zip = Theme.toBuffer();

    nock("https://codeload.github.com")
      .get(`/${gitpath}/zip/${branch}`)
      .reply(200, zip, {
        "Content-Type": "application/zip",
        "content-length": zip.length.toString(),
      });

    jest.spyOn(child_process, "exec");

    stderr.start();

    const libs = await installLib(undefined, fakeCWD, gitpath);

    stderr.stop();
    expect(libs).toContain(path.join(`${user}-${project}`, "slices"));
    expect(
      fs.existsSync(path.join(fakeCWD, `${user}-${project}`, "meta.json"))
    ).toBeTruthy();
  });
});

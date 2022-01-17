/* Pretty important feature not to have a test */
import {
  describe,
  expect,
  test,
  jest,
  afterEach,
  // beforeEach,
  beforeAll,
} from "@jest/globals";
import nock from "nock";
import { installLib } from "../src/steps/install-lib";
// import { stderr, stdout } from "stdout-stderr";
import path from "path";
import os from "os";
import fs from "fs";
import AdmZip from "adm-zip";
import child_process from "child_process";

describe("install-lib", () => {
  const fakeCWD = path.join(os.tmpdir(), "install-lib-test");
  jest.spyOn(process, "exit").mockReturnValue(void 0 as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    if (fs.existsSync(fakeCWD)) {
      fs.rmSync(fakeCWD, { recursive: true, force: true });
    }
    fs.mkdirSync(fakeCWD, { recursive: true });
  });

  test("by default it downloads zip form the main branch from github", async () => {
    const user = "prismicio";
    const project = "foo";
    const gitpath = path.posix.join(user, project);
    const branch = "main";

    const Theme = new AdmZip();
    const themePath = path.join(__dirname, "__stubs__", "fake-project");

    Theme.addLocalFolder(themePath, `${project}-${branch}`);

    const zip = Theme.toBuffer();

    nock("https://codeload.github.com")
      .head(`/${gitpath}/zip/${branch}`)
      .reply(200)
      .get(`/${gitpath}/zip/${branch}`)
      .reply(200, zip, {
        "Content-Type": "application/zip",
        "content-length": zip.length.toString(),
      });

    jest.spyOn(child_process, "exec");

    // stderr.start();
    // stdout.start();
    // const libs = await installLib(undefined, fakeCWD, gitpath);
    await installLib(undefined, fakeCWD, gitpath);

    // stderr.stop();
    // stdout.stop();

    // expect(libs).toContain(
    //   path.posix.join("~", `${user}-${project}`, "slices")
    // );
    expect(
      fs.existsSync(path.join(fakeCWD, `${user}-${project}`, "meta.json"))
    ).toBeTruthy();
    // expect(stderr.output).toContain(
    //   'Slice library "prismicio/foo" was installed successfully'
    // );
  });

  test("when main is not found it should try to download from master", async () => {
    const user = "prismicio";
    const project = "bar";
    const gitpath = path.posix.join(user, project);
    const branch = "master";

    const Theme = new AdmZip();
    const themePath = path.join(__dirname, "__stubs__", "fake-project");

    Theme.addLocalFolder(themePath, `${project}-${branch}`);

    const zip = Theme.toBuffer();

    nock("https://codeload.github.com")
      .head(`/${gitpath}/zip/main`)
      .reply(404)
      .head(`/${gitpath}/zip/${branch}`)
      .reply(200)
      .get(`/${gitpath}/zip/${branch}`)
      .reply(200, zip, {
        "Content-Type": "application/zip",
        "content-length": zip.length.toString(),
      });

    jest.spyOn(child_process, "exec");

    // stderr.start();
    // stdout.start();
    // const libs = await installLib(undefined, fakeCWD, gitpath);
    await installLib(undefined, fakeCWD, gitpath);
    // stderr.stop();
    // stderr.stop();

    // expect(libs).toContain(
    //   path.posix.join("~", `${user}-${project}`, "slices")
    // );
    expect(
      fs.existsSync(path.join(fakeCWD, `${user}-${project}`, "meta.json"))
    ).toBeTruthy();
    // expect(stderr.output).toContain(
    //   'Slice library "prismicio/bar" was installed successfully'
    // );
  });

  test("it can take a branch as an argument", async () => {
    const user = "prismicio";
    const project = "baz";
    const gitpath = path.posix.join(user, project);
    const branch = "not-main-or-master";

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

    // stderr.start();
    // stdout.start();
    // const libs = await installLib(undefined, fakeCWD, gitpath, branch);
    await installLib(undefined, fakeCWD, gitpath, branch);
    // stderr.stop();
    // stderr.stop();

    // expect(libs).toContain(
    //   path.posix.join("~", `${user}-${project}`, "slices")
    // );

    expect(
      fs.existsSync(path.join(fakeCWD, `${user}-${project}`, "meta.json"))
    ).toBeTruthy();
    // expect(stderr.output).toContain(
    //   'Slice library "prismicio/baz" was installed successfully'
    // );
  });
});

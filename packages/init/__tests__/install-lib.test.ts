import {
  describe,
  expect,
  test,
  jest,
  afterEach,
  beforeAll,
} from "@jest/globals";
import nock from "nock";
import { installLib } from "../src/steps/install-lib";
import { stderr, stdout } from "stdout-stderr";
import path from "path";
import os from "os";
import fs from "fs";
import AdmZip from "adm-zip";
import * as utils from "../src/utils";

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

  test("by default it downloads zip form the HEAD branch from github", async () => {
    const user = "prismicio";
    const project = "foo";
    const gitpath = path.posix.join(user, project);
    const branch = "HEAD";

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

    // quick fix, I would rather mock child_process.exec
    jest
      .spyOn(utils, "execCommand")
      .mockResolvedValue({ stderr: "", stdout: "" });

    stderr.start();
    stdout.start();
    const libs = await installLib(undefined, fakeCWD, gitpath);

    stderr.stop();
    stdout.stop();

    expect(
      fs.existsSync(path.join(fakeCWD, `${user}-${project}`, "meta.json"))
    ).toBeTruthy();

    expect(stderr.output).toContain(
      'Slice library "prismicio/foo" was installed successfully'
    );
    expect(libs).toContain(
      path.posix.join("~", `${user}-${project}`, "slices")
    );
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

    // quick fix, I would rather mock child_process.exec
    jest
      .spyOn(utils, "execCommand")
      .mockResolvedValue({ stderr: "", stdout: "" });

    stderr.start();
    stdout.start();
    const libs = await installLib(undefined, fakeCWD, gitpath, branch);
    stderr.stop();
    stderr.stop();

    expect(stderr.output).toContain(
      'Slice library "prismicio/baz" was installed successfully'
    );

    expect(
      fs.existsSync(path.join(fakeCWD, `${user}-${project}`, "meta.json"))
    ).toBeTruthy();

    expect(libs).toContain(
      path.posix.join("~", `${user}-${project}`, "slices")
    );
  });

  test("when given branch or project does not exist.", async () => {
    const user = "prismicio";
    const project = "batman";
    const gitpath = path.posix.join(user, project);
    const branch = "nope";

    nock("https://codeload.github.com")
      .get(`/${gitpath}/zip/${branch}`)
      .reply(404);

    // quick fix, I would rather mock child_process.exec
    jest
      .spyOn(utils, "execCommand")
      .mockResolvedValue({ stderr: "", stdout: "" });

    jest.spyOn(console, "error").mockImplementation(() => jest.fn());

    stderr.start();
    stdout.start();
    await installLib(undefined, fakeCWD, gitpath, branch);
    stderr.stop();
    stderr.stop();

    expect(console.error).toHaveBeenLastCalledWith(
      "Request failed with status code 404"
    );
  });
});

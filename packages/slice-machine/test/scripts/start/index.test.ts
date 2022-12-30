import { describe, test, expect, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
// 2022-12-29 Angelo - This line imports @slicemachine/client, which is not ESM-compatible.
// import start from "../../../scripts/start";

import child_process from "child_process";
import { EventEmitter } from "events";
import pkgJson from "../../../package.json";

describe.skip("start script", () => {
  test("when successful it should spawn a child process (no migrations)", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    vi.spyOn(process, "cwd").mockReturnValue(cwd);

    const fakeChild = vi
      .spyOn(child_process, "spawn")
      .mockImplementationOnce(() => {
        return {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
        } as child_process.ChildProcessWithoutNullStreams;
      });

    const fakeExit = vi
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);

    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify(pkgJson, null, 2)
    );
    await fs.writeFile(
      path.join(cwd, "sm.json"),
      JSON.stringify({
        apiEndpoint: "https://marc.prismic.io/api/v2",
        framework: "next",
        _latest: pkgJson.version,
      })
    );
    await fs.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({
        base: "https://prismic.io",
        cookies: "prismic-auth=biscuits",
      })
    );

    await start();

    expect(fakeChild).toHaveBeenCalled();
    expect(fakeExit).not.toHaveBeenCalled();
  });

  test("when framework is not specified in sm.json it should work", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    vi.spyOn(process, "cwd").mockReturnValue(cwd);

    const fakeChild = vi
      .spyOn(child_process, "spawn")
      .mockImplementationOnce(() => {
        return {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
        } as child_process.ChildProcessWithoutNullStreams;
      });

    const fakeExit = vi
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);

    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify(pkgJson, null, 2)
    );
    await fs.writeFile(
      path.join(cwd, "sm.json"),
      JSON.stringify({
        apiEndpoint: "https://marc.prismic.io/api/v2",
        _latest: pkgJson.version,
      })
    );
    await fs.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({
        base: "https://prismic.io",
        cookies: "prismic-auth=biscuits",
      })
    );

    await start();

    expect(fakeChild).toHaveBeenCalled();
    expect(fakeExit).not.toHaveBeenCalled();
  });

  test("when framework is specified in sm.json but is not supported it should fail", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    vi.spyOn(process, "cwd").mockReturnValue(cwd);

    vi.spyOn(process, "cwd").mockReturnValue(cwd);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "info").mockImplementation(() => undefined);

    const fakeChild = vi
      .spyOn(child_process, "spawn")
      .mockImplementationOnce(() => {
        return {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
        } as child_process.ChildProcessWithoutNullStreams;
      });

    const fakeExit = vi
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);

    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify(pkgJson, null, 2)
    );
    await fs.writeFile(
      path.join(cwd, "sm.json"),
      JSON.stringify({
        apiEndpoint: "https://marc.prismic.io/api/v2",
        _latest: pkgJson.version,
        framework: "marc",
      })
    );
    await fs.writeFile(
      path.join(os.homedir(), ".prismic"),
      JSON.stringify({
        base: "https://prismic.io",
        cookies: "prismic-auth=biscuits",
      })
    );

    await start();

    expect(fakeChild).not.toHaveBeenCalled();
    expect(fakeExit).toHaveBeenCalled();
  });
});

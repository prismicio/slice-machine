import start from "../../../scripts/start";

import child_process from "child_process";
import { EventEmitter } from "events";
import { vol } from "memfs";
import os from "os";
import pkgJson from "../../../package.json";

jest.mock("fs", () => {
  const mem = jest.requireActual("memfs");
  return mem.vol;
});

afterEach(() => {
  vol.reset();
});

describe("start script", () => {
  test("when successful it should spawn a child process (no migrations)", async () => {
    const TMP = os.tmpdir();

    jest.spyOn(process, "cwd").mockReturnValue(TMP);

    const fakeChild = jest
      .spyOn(child_process, "spawn")
      .mockImplementationOnce(() => {
        return {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
        } as child_process.ChildProcessWithoutNullStreams;
      });

    const fakeExit = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);

    vol.fromJSON(
      {
        "package.json": JSON.stringify(pkgJson, null, 2),
        "sm.json": JSON.stringify({
          apiEndpoint: "https://marc.prismic.io/api/v2",
          framework: "next",
          _latest: pkgJson.version,
        }),
      },
      TMP
    );

    vol.fromJSON(
      {
        ".prismic": JSON.stringify({
          base: "https://prismic.io",
          cookies: "prismic-auth=biscuits",
        }),
      },
      os.homedir()
    );

    await start();

    expect(fakeChild).toHaveBeenCalled();
    expect(fakeExit).not.toHaveBeenCalled();
  });

  test("when framework is not specified in sm.json it should work", async () => {
    const TMP = os.tmpdir();

    jest.spyOn(process, "cwd").mockReturnValue(TMP);

    const fakeChild = jest
      .spyOn(child_process, "spawn")
      .mockImplementationOnce(() => {
        return {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
        } as child_process.ChildProcessWithoutNullStreams;
      });

    const fakeExit = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);

    vol.fromJSON(
      {
        "package.json": JSON.stringify(pkgJson, null, 2),
        "sm.json": JSON.stringify({
          apiEndpoint: "https://marc.prismic.io/api/v2",
          _latest: pkgJson.version,
        }),
      },
      TMP
    );

    vol.fromJSON(
      {
        ".prismic": JSON.stringify({
          base: "https://prismic.io",
          cookies: "prismic-auth=biscuits",
        }),
      },
      os.homedir()
    );

    await start();

    expect(fakeChild).toHaveBeenCalled();
    expect(fakeExit).not.toHaveBeenCalled();
  });

  test("when framework is specified in sm.json but is not supported it should fail", async () => {
    const TMP = os.tmpdir();

    jest.spyOn(process, "cwd").mockReturnValue(TMP);
    jest.spyOn(console, "log").mockImplementation(() => undefined);

    const fakeChild = jest
      .spyOn(child_process, "spawn")
      .mockImplementationOnce(() => {
        return {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
        } as child_process.ChildProcessWithoutNullStreams;
      });

    const fakeExit = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);

    vol.fromJSON(
      {
        "package.json": JSON.stringify(pkgJson, null, 2),
        "sm.json": JSON.stringify({
          apiEndpoint: "https://marc.prismic.io/api/v2",
          _latest: pkgJson.version,
          framework: "marc",
        }),
      },
      TMP
    );

    vol.fromJSON(
      {
        ".prismic": JSON.stringify({
          base: "https://prismic.io",
          cookies: "prismic-auth=biscuits",
        }),
      },
      os.homedir()
    );

    await start();

    expect(fakeChild).not.toHaveBeenCalled();
    expect(fakeExit).toHaveBeenCalled();
  });
});

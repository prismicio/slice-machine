import { describe, expect, test, jest, afterEach } from "@jest/globals";
import * as fs from "fs";
import { mocked } from "ts-jest/utils";
import { detectFramework } from "../src/steps";
import { Utils } from "slicemachine-core";
import { stderr } from "stdout-stderr";

jest.mock("fs");

describe("detect-framework", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("when supported frame is found", async () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats); // linting error?
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [Utils.framework.Framework.next]: "beta",
        },
      })
    );

    stderr.start();
    const result = await detectFramework(__dirname).catch();
    stderr.stop();
    expect(fs.lstatSync).toHaveBeenCalled();
    expect(result).toBe(Utils.framework.Framework.next);
  });

  test("unsupported framework", async () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats); // linting error?
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [Utils.framework.Framework.vanillajs]: "0",
        },
      })
    );

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    stderr.start();
    await detectFramework(__dirname).catch();
    stderr.stop();
    expect(fs.lstatSync).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalled();
    expect(stderr.output).toContain(
      `Framework ${Utils.framework.Framework.vanillajs} is not supported`
    );
    expect(logSpy).toHaveBeenCalledWith(
      `Please run ${Utils.bold(
        "npx slicemachine init"
      )} in a Nuxt or Next.js project`
    );
  });

  test("package.json not found", async () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue(undefined); // linting error?

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    stderr.start();
    await detectFramework(__dirname);
    stderr.stop();

    expect(errorSpy).toHaveBeenCalledWith(
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting.."
    );
    expect(stderr.output).toContain("Framework not detected");
    expect(logSpy).toHaveBeenCalledWith(
      `Please run ${Utils.bold(
        "npx slicemachine init"
      )} in a Nuxt or Next.js project`
    );
    expect(exitSpy).toHaveBeenCalled();
  });
});

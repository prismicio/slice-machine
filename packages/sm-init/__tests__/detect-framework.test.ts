import { describe, expect, test, jest, afterEach } from "@jest/globals";
import * as fs from "fs";
import { mocked } from "ts-jest/utils";
import { detectFramework } from "../src/steps";
import { Utils } from "slicemachine-core";
import { stderr } from "stdout-stderr";
import inquirer from "inquirer";

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

  test("framework not found in package.json", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({ dev: 1 } as fs.Stats); // linting error?
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        dependencies: {},
      })
    );

    jest
      .spyOn(inquirer, "prompt")
      .mockResolvedValue({ framework: Utils.Framework.next });

    stderr.start();
    const result = await detectFramework(__dirname);
    stderr.stop();
    expect(result).toBe(Utils.Framework.next);
    expect(fs.lstatSync).toHaveBeenCalled();
    expect(stderr.output).toContain("Framework not detected");
  });

  test("package.json not found", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValue(undefined);

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => "next" as never);
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    stderr.start();
    await detectFramework(__dirname);
    stderr.stop();

    expect(errorSpy).toHaveBeenCalledWith(
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting.."
    );
    expect(stderr.output).toContain("package.json not found");
    expect(exitSpy).toHaveBeenCalled();
  });
});

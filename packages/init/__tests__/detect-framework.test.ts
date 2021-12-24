import * as fs from "fs";
import inquirer from "inquirer";

import { stderr } from "stdout-stderr";
import { mocked } from "ts-jest/utils";
import { describe, expect, test, jest, afterEach } from "@jest/globals";

import { detectFramework } from "../src/steps";
import { Models } from "@slicemachine/core";
import { bold, error } from "@slicemachine/core/build/src/internals";

import { fancyName } from "../src/steps/detect-framework";

jest.mock("fs");

describe("detect-framework", () => {
  void afterEach(() => {
    jest.resetAllMocks();
  });

  test("when supported framework is found", async () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats); // linting error?
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [Models.Frameworks.next]: "beta",
        },
      })
    );

    stderr.start();
    const result = await detectFramework(__dirname).catch();
    stderr.stop();
    expect(fs.lstatSync).toHaveBeenCalled();
    expect(result).toEqual({
      value: Models.Frameworks.next,
      manuallyAdded: false,
    });
  });

  test("framework not found in package.json", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({ dev: 1 } as fs.Stats); // linting error?
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        dependencies: {},
      })
    );

    jest.spyOn(inquirer, "prompt").mockReturnValue(
      Promise.resolve({
        framework: Models.Frameworks.next,
      }) as ReturnType<typeof inquirer.prompt>
    );

    const fakeError = jest
      .spyOn(console, "error")
      .mockImplementationOnce(() => undefined);

    stderr.start();
    const result = await detectFramework(__dirname);
    stderr.stop();
    expect(result).toEqual({
      value: Models.Frameworks.next,
      manuallyAdded: true,
    });
    expect(fs.lstatSync).toHaveBeenCalled();
    expect(fakeError).toBeCalledWith(
      `${error("Error!")} Framework not detected`
    );
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

  test("Unsupported framework: gatsby", async () => {
    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({ dev: 1 } as fs.Stats);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        dependencies: {
          [Models.Frameworks.gatsby]: "beta",
          [Models.Frameworks.react]: "beta",
        },
      })
    );

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    stderr.start();
    await detectFramework(__dirname);
    stderr.stop();

    expect(exitSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      `${error("Error!")} Gatsby is currently not supported`
    );
    expect(logSpy).toHaveBeenCalledWith(
      `Please run ${bold("npx slicemachine init")} in a Nuxt or Next.js project`
    );
  });
});

describe("framework.fancyName", () => {
  test("next should be Next.js", () => {
    const wanted = "Next.js";
    const result = fancyName(Models.Frameworks.next);
    expect(result).toBe(wanted);
  });

  test("else the first letter should be capitalised", () => {
    const values = Object.values(Models.Frameworks);
    values.forEach((value) => {
      const result = fancyName(value).charAt(0);
      expect(result).toBe(result.toUpperCase());
    });
  });
});

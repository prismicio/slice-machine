import { describe, expect, test, jest, afterEach } from "@jest/globals";
import * as fs from "fs";
import { mocked } from "jest-mock";
import { detectFramework } from "../src/steps";
import { Models } from "@slicemachine/core";
import { stderr } from "stdout-stderr";
import inquirer from "inquirer";
import { logs } from "../src/utils";

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
      version: "beta",
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
      }) as unknown as ReturnType<typeof inquirer.prompt>
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
      `${logs.error("Error!")} Framework not detected`
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
      `${logs.error("Error!")} Gatsby is currently not supported`
    );
    expect(logSpy).toHaveBeenCalledWith(
      `Please run ${logs.bold(
        "npx @slicemachine/init"
      )} in a Nuxt or Next.js project`
    );
  });
});

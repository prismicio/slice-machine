import { describe, expect, test, jest, afterEach } from "@jest/globals";
import { framework } from "../../../src/utils";
import * as fs from "fs";
import { mocked } from "ts-jest/utils";

jest.mock("fs");

describe("framework.detectFramework", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("it defaults to vanillajs when no framework is found in the package.json", () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ dependencies: {} }));

    const result = framework.detectFramework(__dirname);

    expect(mockedFs.lstatSync).toHaveBeenCalled();
    expect(result).toEqual(framework.Framework.vanillajs);
  });

  // poor mans property based testing
  const valuesToCheck: string[] = [
    ...Object.values(framework.Framework),
    "",
    "foo",
  ];
  valuesToCheck.forEach((value) => {
    test("it will return a support framework when a support framework is found in the package.json", () => {
      const mockedFs = mocked(fs, true);
      mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

      mockedFs.readFileSync.mockReturnValue(
        JSON.stringify({
          dependencies: {
            [value]: "beta",
          },
        })
      );

      const wanted = framework.isValidFramework(value as framework.Framework)
        ? value
        : framework.Framework.vanillajs;

      const result = framework.detectFramework(__dirname);
      expect(mockedFs.lstatSync).toHaveBeenCalled();
      expect(result).toEqual(wanted);
    });
  });

  test("it will throw an error when no package.json is found", () => {
    const wanted =
      "[api/env]: Unrecoverable error. Could not find package.json. Exiting..";
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue(undefined);

    const spy = jest
      .spyOn(console, "error")
      .mockImplementationOnce(() => undefined);
    expect(() => framework.detectFramework(__dirname)).toThrow(wanted);
    expect(spy).toHaveBeenCalledWith(wanted);
  });
});

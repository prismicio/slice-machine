import { describe, expect, test, jest, afterEach } from "@jest/globals";
import { Framework } from "../../../src/utils";
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

    const result = Framework.detectFramework(__dirname);

    expect(mockedFs.lstatSync).toHaveBeenCalled();
    expect(result).toEqual(Framework.FrameworkEnum.vanillajs);
  });

  // poor mans property based testing
  const valuesToCheck: string[] = [
    ...Object.values(Framework.FrameworkEnum),
    "",
    "foo",
  ];

  test("gatsby", () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [Framework.FrameworkEnum.gatsby]: "beta",
          [Framework.FrameworkEnum.react]: "beta",
        },
      })
    );

    const result = Framework.detectFramework(__dirname);
    expect(result).toEqual(Framework.FrameworkEnum.gatsby);
  });
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

      const fallback =
        value === Framework.FrameworkEnum.gatsby
          ? Framework.FrameworkEnum.gatsby
          : Framework.FrameworkEnum.vanillajs;

      const wanted = Framework.isValidFramework(
        value as Framework.FrameworkEnum
      )
        ? value
        : fallback;

      const result = Framework.detectFramework(__dirname);
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
    expect(() => Framework.detectFramework(__dirname)).toThrow(wanted);
    expect(spy).toHaveBeenCalledWith(wanted);
  });
});

describe("framework.fancyName", () => {
  test("next should be Next.js", () => {
    const wanted = "Next.js";
    const result = Framework.fancyName(Framework.FrameworkEnum.next);
    expect(result).toBe(wanted);
  });

  test("else the first letter should be capitalised", () => {
    const values = Object.values(Framework.FrameworkEnum);
    values.forEach((value) => {
      const result = Framework.fancyName(value).charAt(0);
      expect(result).toBe(result.toUpperCase());
    });
  });
});

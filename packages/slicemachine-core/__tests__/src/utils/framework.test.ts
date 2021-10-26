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

  test("gatsby", () => {
    const mockedFs = mocked(fs, true);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [framework.Framework.gatsby]: "beta",
          [framework.Framework.react]: "beta",
        },
      })
    );

    const result = framework.detectFramework(__dirname);
    expect(result).toEqual(framework.Framework.gatsby);
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
        value === framework.Framework.gatsby
          ? framework.Framework.gatsby
          : framework.Framework.vanillajs;

      const wanted = framework.isValidFramework(value as framework.Framework)
        ? value
        : fallback;

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

describe("framework.fancyName", () => {
  test("next should be Next.js", () => {
    const wanted = "Next.js";
    const result = framework.fancyName(framework.Framework.next);
    expect(result).toBe(wanted);
  });

  test("else the first letter should be capatalised", () => {
    const values = Object.values(framework.Framework);
    values.forEach((value) => {
      const result = framework.fancyName(value).charAt(0);
      expect(result).toBe(result.toUpperCase());
    });
  });
});

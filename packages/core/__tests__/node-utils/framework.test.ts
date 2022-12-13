import { describe, expect, test, jest, afterEach } from "@jest/globals";
import { Frameworks, SupportedFrameworks } from "../../src/models/Framework";
import { JsonPackage } from "../../src/node-utils/pkg";
import * as FrameworkUtils from "../../src/node-utils/framework";
import * as fs from "fs";
import { Manifest } from "../../src/models/Manifest";

jest.mock("fs");

describe("framework.fancyName", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("it should return a fancy name", () => {
    expect(FrameworkUtils.fancyName(Frameworks.gatsby)).toEqual("Gatsby");
  });

  test("it should return a Next.js for next (special case)", () => {
    expect(FrameworkUtils.fancyName(Frameworks.next)).toEqual("Next.js");
  });
});

describe("framework.isFrameworkSupported", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const supportedFramework = SupportedFrameworks[0];
  const unsupportedFramework = FrameworkUtils.UnsupportedFrameWorks[0];

  test("it should return true to supported frameworks", () => {
    expect(FrameworkUtils.isFrameworkSupported(supportedFramework)).toEqual(
      true
    );
  });

  test("it should return false to unsupported frameworks", () => {
    expect(FrameworkUtils.isFrameworkSupported(unsupportedFramework)).toEqual(
      false
    );
  });
});

describe("framework.detectFramework", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("it should detect a supported framework", () => {
    const pkg: JsonPackage = {
      name: "fake",
      version: "fakeBeta",
      dependencies: {
        [Frameworks.next]: "beta",
      },
    };

    const result: Frameworks = FrameworkUtils.detectFramework(pkg);
    expect(result).toEqual(Frameworks.next);
  });

  test("it should not detect an unsupported framework and fallback to vanillajs", () => {
    const pkg: JsonPackage = {
      name: "fake",
      version: "fakeBeta",
      dependencies: {
        [Frameworks.next]: "beta",
      },
    };

    // simulate supporting 0 frameworks.
    const result: Frameworks = FrameworkUtils.detectFramework(pkg, []);
    expect(result).toEqual(Frameworks.vanillajs);
  });
});

describe("framework.defineFrameworks", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("it should take the framework from the pkg json if there isn't in the manifest", () => {
    const fakeManifest = {
      apiEndpoint: "fake api endpoint",
    };

    const mockedFs = jest.mocked(fs);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [Frameworks.next]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd: "not important",
      manifest: fakeManifest,
    });
    expect(result).toEqual(Frameworks.next);
  });

  test("it should take the framework from the manifest", () => {
    const fakeManifest: Manifest = {
      apiEndpoint: "fake api endpoint",
      framework: Frameworks.next,
    };

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd: "not important",
      manifest: fakeManifest,
    });
    expect(result).toEqual(Frameworks.next);
  });

  test("it should take the framework from the pkg json if the one in manifest isn't supported", () => {
    const fakeManifest: Manifest = {
      apiEndpoint: "fake api endpoint",
      framework: FrameworkUtils.UnsupportedFrameWorks[0],
    };

    const mockedFs = jest.mocked(fs);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [Frameworks.next]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd: "not important",
      manifest: fakeManifest,
    });
    expect(result).toEqual(Frameworks.next);
  });

  test("it should default to vanillajs if no manifest and the pkg json framework is unsupported", () => {
    const unsupportedFramework = FrameworkUtils.UnsupportedFrameWorks[0];

    const mockedFs = jest.mocked(fs);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [unsupportedFramework]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd: "not important",
    });
    expect(result).toEqual(Frameworks.vanillajs);
  });

  test("it should default to vanillajs if package and manifest aren't good", () => {
    const unsupportedFramework = FrameworkUtils.UnsupportedFrameWorks[0];

    const fakeManifest: Manifest = {
      apiEndpoint: "fake api endpoint",
      framework: unsupportedFramework,
    };

    const mockedFs = jest.mocked(fs);
    mockedFs.lstatSync.mockReturnValue({ dev: 1 } as fs.Stats);

    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: {
          [unsupportedFramework]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd: "not important",
      manifest: fakeManifest,
    });
    expect(result).toEqual(Frameworks.vanillajs);
  });
});

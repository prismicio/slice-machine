import { afterEach, describe, expect, test, vi } from "vitest";
import {
  Frameworks,
  SupportedFrameworks,
} from "../../../core/models/Framework";
import { JsonPackage } from "../../../core/node-utils/pkg";
import * as FrameworkUtils from "../../../core/node-utils/framework";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Manifest } from "../../../core/models/Manifest";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";

describe("framework.fancyName", () => {
  afterEach(() => {
    vi.resetAllMocks();
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
    vi.resetAllMocks();
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
    vi.resetAllMocks();
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
    vi.resetAllMocks();
  });

  test("it should take the framework from the pkg json if there isn't in the manifest", async () => {
    const adapter = createTestPlugin();
    const cwd = await createTestProject({ adapter });

    const manifest = JSON.parse(
      await fs.readFile(path.join(cwd, "slicemachine.config.json"), "utf8")
    );
    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        dependencies: {
          [Frameworks.next]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd,
      manifest,
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

  test("it should take the framework from the pkg json if the one in manifest isn't supported", async () => {
    const adapter = createTestPlugin();
    const cwd = await createTestProject({
      adapter,
      // @ts-expect-error - `framework` no longer exists in the manifest.
      framework: FrameworkUtils.UnsupportedFrameWorks[0],
    });

    const manifest = JSON.parse(
      await fs.readFile(path.join(cwd, "slicemachine.config.json"), "utf8")
    );
    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        dependencies: {
          [Frameworks.next]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd,
      manifest,
    });
    expect(result).toEqual(Frameworks.next);
  });

  test("it should default to vanillajs if no manifest and the pkg json framework is unsupported", async () => {
    const adapter = createTestPlugin();
    const cwd = await createTestProject({ adapter });

    const unsupportedFramework = FrameworkUtils.UnsupportedFrameWorks[0];

    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        dependencies: {
          [unsupportedFramework]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd,
    });
    expect(result).toEqual(Frameworks.vanillajs);
  });

  test("it should default to vanillajs if package and manifest aren't good", async () => {
    const unsupportedFramework = FrameworkUtils.UnsupportedFrameWorks[0];

    const adapter = createTestPlugin();
    const cwd = await createTestProject({
      adapter,
      // @ts-expect-error - `framework` no longer exists in the manifest.
      framework: unsupportedFramework,
    });

    const manifest = JSON.parse(
      await fs.readFile(path.join(cwd, "slicemachine.config.json"), "utf8")
    );
    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        dependencies: {
          [unsupportedFramework]: "beta",
        },
      })
    );

    const result: Frameworks = FrameworkUtils.defineFramework({
      cwd,
      manifest,
    });
    expect(result).toEqual(Frameworks.vanillajs);
  });
});

describe("framework.defineFrameworkWithVersion", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("it should return the version if found", async () => {
    const adapter = createTestPlugin();
    const cwd = await createTestProject({ adapter });

    const manifest = JSON.parse(
      await fs.readFile(path.join(cwd, "slicemachine.config.json"), "utf8")
    );
    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        dependencies: {
          [Frameworks.next]: "beta",
        },
      })
    );

    const result = FrameworkUtils.defineFrameworkWithVersion({
      cwd,
      manifest,
    });
    expect(result).toEqual({ framework: Frameworks.next, version: "beta" });
  });

  test("it should return undefined if framework is nto found", async () => {
    const adapter = createTestPlugin();
    const cwd = await createTestProject({ adapter });

    const manifest = JSON.parse(
      await fs.readFile(path.join(cwd, "slicemachine.config.json"), "utf8")
    );
    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        dependencies: {},
      })
    );

    const result = FrameworkUtils.defineFrameworkWithVersion({
      cwd,
      manifest,
    });
    expect(result).toEqual({
      framework: Frameworks.vanillajs,
      version: undefined,
    });
  });
});

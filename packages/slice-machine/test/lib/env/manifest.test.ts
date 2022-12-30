import { describe, test, expect } from "vitest";
import handleManifest from "../../../lib/env/manifest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("lib/env/manifest", () => {
  test("detects if framework is defined", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    await fs.writeFile(
      path.join(cwd, "sm.json"),
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
        framework: "next",
      })
    );

    const result = handleManifest(cwd, true);

    expect(result.content).not.toBeNull();
    expect(result.state).toEqual("Valid");
  });

  test("when framework is an unsupported framework it should return an invalid result with a message", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    await fs.writeFile(
      path.join(cwd, "sm.json"),
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
        framework: "foo",
      })
    );

    const result = handleManifest(cwd, true);

    expect(result.content).toBeNull();
    expect(result.state).toEqual("InvalidJson");
    expect(result.message).toEqual(
      '[sm.json] Expecting framework at 1.framework but instead got: "foo" (framework should be one of none, nuxt, previousNuxt, next, gatsby, vue, react, svelte, vanillajs, previousNext. Set framework to one of these values or remove it and slice-machine will guess the framework.)'
    );
  });

  test("when framework is an undefined in sm.json it should be fine", async () => {
    await fs.mkdir(os.tmpdir(), { recursive: true });
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "project-"));

    await fs.writeFile(
      path.join(cwd, "sm.json"),
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
      })
    );

    const result = handleManifest(cwd, true);

    expect(result.content).not.toBeNull();
    expect(result.state).toEqual("Valid");
  });
});

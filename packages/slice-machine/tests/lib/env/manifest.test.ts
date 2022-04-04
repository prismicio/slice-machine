import fs from "fs";
import handleManifest from "../../../lib/env/manifest";
import os from "os";
import { describe, test, expect, jest } from "@jest/globals";

describe("lib/env/manifest", () => {
  test("detects if framework is defined", () => {
    jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
        framework: "next",
      })
    );

    const result = handleManifest(os.tmpdir());

    expect(result.content).not.toBeNull();
    expect(result.state).toEqual("Valid");
  });

  test("when framework is an unsupported framework it should return an invalid result with a message", () => {
    jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
        framework: "foo",
      })
    );

    const result = handleManifest(os.tmpdir());

    expect(result.content).toBeNull();
    expect(result.state).toEqual("InvalidJson");
    expect(result.message).toEqual(
      '[sm.json] Expecting "none" | "nuxt" | "previousNuxt" | "next" | "gatsby" | "vue" | "react" | "svelte" | "vanillajs" | "previousNext" at 1.framework but instead got: "foo"'
    );
  });

  test("when framework is an undefined framework it should return an invalid result with a message", () => {
    jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
      })
    );

    const result = handleManifest(os.tmpdir());

    expect(result.content).toBeNull();
    expect(result.state).toEqual("InvalidFramework");
    expect(result.message).toEqual(
      'Property "framework" in (./sm.json) must be one of "none", "nuxt", "previousNuxt", "next", "gatsby", "vue", "react", "svelte", "vanillajs", "previousNext".'
    );
  });

  // test("loads of errors", () => {
  //   jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
  //   jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
  //     JSON.stringify({
  //       apiEndpoint: "https://example.io/api/v2",
  //       framework: "fgoo"
  //     })
  //   );

  //   const result = handleManifest(os.tmpdir());

  //   expect(result.content).toBeNull();
  // })
});

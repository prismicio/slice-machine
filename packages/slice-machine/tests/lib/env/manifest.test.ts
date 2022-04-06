import fs from "fs";
import handleManifest from "../../../lib/env/manifest";
import os from "os";
import { describe, test, expect, jest } from "@jest/globals";

describe("lib/env/manifest", () => {
  test("detects if framework is defined", () => {
    jest.spyOn(fs, "lstatSync").mockReturnValue({} as fs.Stats);
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
    jest.spyOn(fs, "lstatSync").mockReturnValue({} as fs.Stats);
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
      '[sm.json] Expecting framework at 1.framework but instead got: "foo" (framework should be one of none, nuxt, previousNuxt, next, gatsby, vue, react, svelte, vanillajs, previousNext. Set framework to one of these values or remove it and slice-machine will guess the framework.)'
    );
  });

  test("when framework is an undefined in sm.json it should be fine", () => {
    jest.spyOn(fs, "lstatSync").mockReturnValue({} as fs.Stats);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
      })
    );

    const result = handleManifest(os.tmpdir());

    expect(result.content).not.toBeNull();
    expect(result.state).toEqual("Valid");
  });
});

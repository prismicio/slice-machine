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

  test("it should return an 'invalid' result if framework is not defined", () => {
    jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
      })
    );

    const result = handleManifest(os.tmpdir());

    expect(result.content).toBeNull();
    expect(result.state).toEqual("InvalidJson");
    expect(result.message).toEqual(
      '[sm.json] Expecting "none" | "nuxt" | "previousNuxt" | "next" | "gatsby" | "vue" | "react" | "svelte" | "vanillajs" | "previousNext" at 0.framework but instead got: undefined'
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

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

  test("when frame work is invalid it should default to 'none'", () => {
    jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        apiEndpoint: "https://example.prismic.io/api/v2",
      })
    );

    const result = handleManifest(os.tmpdir());

    expect(result.state).toEqual("Valid");
    expect(result.content?.framework).toEqual("none");
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

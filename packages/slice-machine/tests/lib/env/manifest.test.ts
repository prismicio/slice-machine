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

    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementationOnce(() => undefined);

    const result = handleManifest(os.tmpdir());

    expect(result.content).toBeNull();
    expect(result.state).toEqual("InvalidFramework");
    expect(result.message).toContain('Property "framework" must be one of ');
    expect(errorSpy).toHaveBeenCalled();
  });
});

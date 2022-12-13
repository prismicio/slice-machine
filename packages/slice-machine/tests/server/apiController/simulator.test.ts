// We mock the getEnv service
import simulatorHandler from "../../../server/src/api/simulator";
import "@testing-library/jest-dom";
import { Frameworks } from "@slicemachine/core/build/models";
import { SimulatorCheckResponse } from "@models/common/Simulator";
import { RequestWithEnv } from "server/src/api/http/common";
import fs from "fs";

describe("simulator controller", () => {
  test("it should return all checks ko when no preview url is sent", async () => {
    const requestWithoutPreviewUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {},
      },
    } as RequestWithEnv;

    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        name: "",
        version: "",
        dependencies: {},
        devDependencies: {},
      })
    );

    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithoutPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ko");
  });

  test("it should return ok on manifest if an url is present", async () => {
    const requestWithPreviewUrl = {
      env: {
        framework: Frameworks.next,
        manifest: {
          localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
        },
      },
    } as RequestWithEnv;

    jest.spyOn(fs, "lstatSync").mockReturnValueOnce({} as fs.Stats);
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
      JSON.stringify({
        name: "",
        version: "",
        dependencies: {},
        devDependencies: {},
      })
    );

    const previewCheckResponse: SimulatorCheckResponse = await simulatorHandler(
      requestWithPreviewUrl
    );
    expect(previewCheckResponse.manifest).toBe("ok");
  });
});

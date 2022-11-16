import { vol } from "memfs";
import deleteCT from "../../../server/src/api/custom-types/delete";
import backendEnvironment from "../../__mocks__/backendEnvironment";
import fs from "fs";
import { RequestWithEnv } from "server/src/api/http/common";

jest.mock(`fs`, () => {
  const { vol } = jest.requireActual("memfs");
  return vol;
});

jest.mock("../../../server/src/api/common/LibrariesState", () => {
  return {
    generateState: jest.fn(),
  };
});

describe("Delete Custom Type files", () => {
  const CUSTOM_TYPE_TO_DELETE = "unwanted-ct";
  const mockRequest = {
    env: backendEnvironment,
    errors: {},
    query: { id: CUSTOM_TYPE_TO_DELETE },
  } as unknown as RequestWithEnv;
  const warn = console.warn;
  const error = console.error;
  afterEach(() => {
    vol.reset();
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    console.warn = jest.fn();
    console.error = jest.fn();
    // @ts-expect-error don't need the right type for mocking purposes
    jest.spyOn(fs, "lstatSync").mockReturnValue(true);
  });
  afterAll(() => {
    console.warn = warn;
    console.error = error;
  });

  it("should delete all the custom type files", async () => {
    const mockRmSync = jest.spyOn(fs, "rmSync");
    const mockWriteFileSync = jest.spyOn(fs, "writeFileSync");
    const mockReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      })
    );

    const result = await deleteCT(mockRequest);

    expect(mockRmSync).toHaveBeenCalledWith(
      `/test/customtypes/${CUSTOM_TYPE_TO_DELETE}`,
      {
        force: true,
        recursive: true,
      }
    );
    expect(mockRmSync).toHaveBeenCalledWith(
      `/test/.slicemachine/assets/customtypes/${CUSTOM_TYPE_TO_DELETE}`,
      {
        force: true,
        recursive: true,
      }
    );
    expect(mockRmSync).toHaveBeenCalledTimes(2);

    expect(mockReadFileSync).toBeCalled();

    expect(mockWriteFileSync).toBeCalledWith(
      "/test/.slicemachine/mock-config.json",
      JSON.stringify({ _cts: { "ct-2": { name: "bar" } } }, null, 2),
      "utf8"
    );

    expect(result).toStrictEqual({});
  });

  it("should log and return an error if the custom types deletion fails", async () => {
    const mockRmSync = jest.spyOn(fs, "rmSync").mockImplementation(() => {
      throw new Error("Couldn't remove custom type");
    });
    const mockWriteFileSync = jest.spyOn(fs, "writeFileSync");
    const mockReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      })
    );

    const result = await deleteCT(mockRequest);

    expect(mockRmSync).toHaveBeenCalledWith(
      `/test/customtypes/${CUSTOM_TYPE_TO_DELETE}`,
      {
        force: true,
        recursive: true,
      }
    );
    expect(mockRmSync).toHaveBeenCalledTimes(1);

    expect(mockReadFileSync).not.toBeCalled();
    expect(mockWriteFileSync).not.toBeCalled();

    expect(console.error).toHaveBeenCalledWith(
      "[custom-type/delete] Error: Couldn't remove custom type"
    );
    expect(result).toStrictEqual({
      err: Error("Couldn't remove custom type"),
      reason: "We couldn't delete your custom type. Check your terminal.",
      status: 500,
      type: "error",
    });
  });

  it("should log and return a warning if the custom type asset deletion fails", async () => {
    const mockRmSync = jest
      .spyOn(fs, "rmSync")
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error("Couldn't remove custom type");
      });
    const mockWriteFileSync = jest.spyOn(fs, "writeFileSync");
    const mockReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      })
    );

    const result = await deleteCT(mockRequest);

    expect(mockRmSync).toHaveBeenCalledTimes(2);

    expect(mockReadFileSync).toHaveBeenCalled();
    expect(mockWriteFileSync).toHaveBeenCalled();

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      `[custom-type/delete] Could not delete your custom type assets files.\n`,
      `To resolve this, manually delete the directory /test/.slicemachine/assets/customtypes/unwanted-ct`
    );
    expect(result).toStrictEqual({
      err: {},
      reason:
        "Something went wrong when deleting your Custom Type. Check your terminal.",
      status: 500,
      type: "warning",
    });
  });

  it("should log and return a warning if the mock-config update fails", async () => {
    const mockRmSync = jest.spyOn(fs, "rmSync");
    const mockWriteFileSync = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementationOnce(() => {
        throw new Error("couldn't update file");
      });
    const mockReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue(
      JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      })
    );

    const result = await deleteCT(mockRequest);

    expect(mockRmSync).toHaveBeenCalledTimes(2);

    expect(mockReadFileSync).toBeCalled();
    expect(mockWriteFileSync).toBeCalled();

    expect(console.error).toHaveBeenCalledWith(
      `[custom-type/delete] Could not delete your custom type from the mock-config.json.\n`,
      `To resolve this, manually remove the ${CUSTOM_TYPE_TO_DELETE} field in /test/.slicemachine/mock-config.json`
    );
    expect(console.error).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      err: {},
      reason:
        "Something went wrong when deleting your Custom Type. Check your terminal.",
      status: 500,
      type: "warning",
    });
  });
});

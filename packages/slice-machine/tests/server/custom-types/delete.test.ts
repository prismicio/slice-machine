import { vol } from "memfs";
import deleteCT from "../../../server/src/api/custom-types/delete";
import backendEnvironment from "../../__mocks__/backendEnvironment";
import fs from "fs";
import { RequestWithEnv } from "server/src/api/http/common";

jest.mock(`fs`, () => {
  const { vol, createFsFromVolume } = jest.requireActual("memfs");
  const newFs = createFsFromVolume(vol);
  newFs["rmSync"] = vol["rmSync"].bind(vol);
  newFs["realpathSync"] = vol["realpathSync"].bind(vol);
  return newFs;
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
  const error = console.error;
  let mockRmSync: jest.SpyInstance;
  let mockWriteFileSync: jest.SpyInstance;
  let mockReadFileSync: jest.SpyInstance;
  let mockAccessSync: jest.SpyInstance;
  afterEach(() => {
    vol.reset();
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    console.error = jest.fn();
    mockRmSync = jest.spyOn(fs, "rmSync");
    mockWriteFileSync = jest.spyOn(fs, "writeFileSync");
    mockReadFileSync = jest.spyOn(fs, "readFileSync");
    mockAccessSync = jest.spyOn(fs, "accessSync");
  });
  afterAll(() => {
    console.error = error;
  });

  it("should delete and update all the custom type files", async () => {
    vol.fromJSON({
      "/test/customtypes/unwanted-ct/index.json": JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      }),
      "/test/.slicemachine/assets/customtypes/unwanted-ct/mocks.json":
        JSON.stringify({
          _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
        }),
      "/test/.slicemachine/mock-config.json": JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      }),
    });

    const result = await deleteCT(mockRequest);

    expect(mockRmSync).toHaveBeenCalled();

    expect(mockRmSync).toHaveBeenCalledTimes(2);
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

    expect(mockReadFileSync).toBeCalled();

    expect(mockWriteFileSync).toBeCalledWith(
      "/test/.slicemachine/mock-config.json",
      JSON.stringify({ _cts: { "ct-2": { name: "bar" } } }, null, 2),
      "utf8"
    );

    expect(result).toStrictEqual({});
  });

  it("should log and return an error if the custom types deletion fails", async () => {
    const result = await deleteCT(mockRequest);

    expect(mockAccessSync).toHaveBeenCalledTimes(1);
    expect(mockAccessSync).toHaveBeenCalledWith(
      "/test/customtypes/unwanted-ct",
      fs.constants.W_OK
    );

    expect(mockReadFileSync).not.toBeCalled();
    expect(mockWriteFileSync).not.toBeCalled();

    expect(console.error).toHaveBeenCalledWith(
      "[custom-type/delete] Error: ENOENT: no such file or directory, access '/test/customtypes/unwanted-ct'"
    );
    expect(result).toStrictEqual({
      err: Error(
        "ENOENT: no such file or directory, access '/test/customtypes/unwanted-ct'"
      ),
      reason: "We couldn't delete your custom type. Check your terminal.",
      status: 500,
      type: "error",
    });
  });

  it("should log and return a warning if the custom type asset deletion fails", async () => {
    vol.fromJSON({
      "/test/.slicemachine/mock-config.json": JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      }),
      "/test/customtypes/unwanted-ct/index.json": JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      }),
    });

    const result = await deleteCT(mockRequest);

    expect(mockAccessSync).toHaveBeenCalledTimes(3);
    expect(mockAccessSync).toHaveBeenNthCalledWith(
      1,
      "/test/customtypes/unwanted-ct",
      fs.constants.W_OK
    );
    expect(mockAccessSync).toHaveBeenNthCalledWith(
      2,
      "/test/customtypes/unwanted-ct/index.json",
      fs.constants.W_OK
    );
    expect(mockAccessSync).toHaveBeenNthCalledWith(
      3,
      "/test/.slicemachine/assets/customtypes/unwanted-ct",
      fs.constants.W_OK
    );

    expect(mockRmSync).toHaveBeenCalledTimes(1);

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
    vol.fromJSON({
      "/test/.slicemachine/mock-config.json": JSON.stringify({}),
      "/test/customtypes/unwanted-ct/index.json": JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      }),
      "/test/.slicemachine/assets/customtypes/unwanted-ct/mocks.json":
        JSON.stringify({
          _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
        }),
    });

    const result = await deleteCT(mockRequest);

    expect(mockRmSync).toHaveBeenCalledTimes(2);

    expect(mockReadFileSync).toBeCalled();
    expect(mockWriteFileSync).not.toBeCalled();

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

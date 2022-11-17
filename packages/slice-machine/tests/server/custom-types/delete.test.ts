import { vol } from "memfs";
import deleteCT from "../../../server/src/api/custom-types/delete";
import backendEnvironment from "../../__mocks__/backendEnvironment";
import { RequestWithEnv } from "server/src/api/http/common";

jest.mock(`fs`, () => {
  const { vol, createFsFromVolume } = jest.requireActual("memfs");
  const newFs = createFsFromVolume(vol);
  // The following is needed due to rmSync not existing on memfs
  // Github issue link on fs-monkey: https://github.com/streamich/fs-monkey/issues/320
  newFs["rmSync"] = vol["rmSync"].bind(vol);
  newFs["realpathSync"] = vol["realpathSync"].bind(vol);
  return newFs;
});

jest.mock("../../../server/src/api/common/LibrariesState", () => {
  return {
    generateState: jest.fn(),
  };
});

const readMockConfig = () =>
  JSON.parse(
    vol.readFileSync(`/test/.slicemachine/mock-config.json`, {
      encoding: "utf8",
    }) as string
  );

const readAssetsFiles = () =>
  vol.readdirSync(`/test/.slicemachine/assets/customtypes`);

const readCustomTypesFiles = () => vol.readdirSync(`/test/customtypes`);

describe("Delete Custom Type files", () => {
  const CUSTOM_TYPE_TO_DELETE = "unwanted-ct";
  const mockRequest = {
    env: backendEnvironment,
    errors: {},
    query: { id: CUSTOM_TYPE_TO_DELETE },
  } as unknown as RequestWithEnv;
  const error = console.error;
  afterEach(() => {
    vol.reset();
  });
  beforeEach(() => {
    console.error = jest.fn();
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

    expect(readCustomTypesFiles()).toStrictEqual([CUSTOM_TYPE_TO_DELETE]);
    expect(readAssetsFiles()).toStrictEqual([CUSTOM_TYPE_TO_DELETE]);
    expect(readMockConfig()).toStrictEqual({
      _cts: { "ct-2": { name: "bar" }, "unwanted-ct": { name: "foo" } },
    });

    const result = await deleteCT(mockRequest);

    expect(readCustomTypesFiles()).toStrictEqual([]);
    expect(readAssetsFiles()).toStrictEqual([]);
    expect(readMockConfig()).toStrictEqual({
      _cts: { "ct-2": { name: "bar" } },
    });
    expect(result).toStrictEqual({});
  });

  it("should log and return an error if the custom types deletion fails", async () => {
    vol.fromJSON({
      "/test/customtypes/test.json": JSON.stringify({}),
      "/test/.slicemachine/assets/customtypes/unwanted-ct/mocks.json":
        JSON.stringify({
          _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
        }),
      "/test/.slicemachine/mock-config.json": JSON.stringify({
        _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
      }),
    });

    expect(readCustomTypesFiles()).toStrictEqual(["test.json"]);
    expect(readAssetsFiles()).toStrictEqual([CUSTOM_TYPE_TO_DELETE]);
    expect(readMockConfig()).toStrictEqual({
      _cts: { "ct-2": { name: "bar" }, "unwanted-ct": { name: "foo" } },
    });

    const result = await deleteCT(mockRequest);

    expect(readCustomTypesFiles()).toStrictEqual(["test.json"]);
    expect(readAssetsFiles()).toStrictEqual([CUSTOM_TYPE_TO_DELETE]);
    expect(readMockConfig()).toStrictEqual({
      _cts: { "unwanted-ct": { name: "foo" }, "ct-2": { name: "bar" } },
    });

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
      "/test/.slicemachine/assets/customtypes/test.json": "",
    });

    expect(readCustomTypesFiles()).toStrictEqual([CUSTOM_TYPE_TO_DELETE]);
    expect(readAssetsFiles()).toStrictEqual(["test.json"]);
    expect(readMockConfig()).toStrictEqual({
      _cts: { "ct-2": { name: "bar" }, "unwanted-ct": { name: "foo" } },
    });

    const result = await deleteCT(mockRequest);

    expect(readCustomTypesFiles()).toStrictEqual([]);
    expect(readAssetsFiles()).toStrictEqual(["test.json"]);
    expect(readMockConfig()).toStrictEqual({
      _cts: { "ct-2": { name: "bar" } },
    });

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

    expect(readCustomTypesFiles()).toStrictEqual([CUSTOM_TYPE_TO_DELETE]);
    expect(readAssetsFiles()).toStrictEqual([CUSTOM_TYPE_TO_DELETE]);
    expect(readMockConfig()).toStrictEqual({});

    const result = await deleteCT(mockRequest);

    expect(readCustomTypesFiles()).toStrictEqual([]);
    expect(readAssetsFiles()).toStrictEqual([]);
    expect(readMockConfig()).toStrictEqual({});

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

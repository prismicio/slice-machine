import { vol } from "memfs";
import { deleteSlice } from "../../../server/src/api/slices/delete";
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

const SLICE_TO_DELETE_ID = "unwanted_slice";
const SLICE_TO_DELETE_NAME = "UnwantedSlice";
const SLICE_TO_DELETE_LIBRARY = "slices";
const SLICE_TO_DELETE_MOCKS = [
  {
    variation: "default-slice",
    name: "Default slice",
    slice_type: SLICE_TO_DELETE_ID,
    items: [],
    primary: {},
  },
];
const SLICE_TO_DELETE_MOCK = {
  id: SLICE_TO_DELETE_ID,
  type: "SharedSlice",
  name: SLICE_TO_DELETE_NAME,
  variations: [],
};
const MOCK_CONFIG = {
  [SLICE_TO_DELETE_LIBRARY]: {
    [SLICE_TO_DELETE_NAME]: { name: SLICE_TO_DELETE_NAME },
    "slice-2": { name: "bar" },
  },
};

const readMockConfig = () =>
  JSON.parse(
    vol.readFileSync(`/test/.slicemachine/mock-config.json`, {
      encoding: "utf8",
    }) as string
  );

const readAssetsFiles = () =>
  vol.readdirSync(`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}`);

const readSliceFiles = () =>
  vol.readdirSync(`/test/${SLICE_TO_DELETE_LIBRARY}`);

describe("Delete slice files", () => {
  const mockRequest = {
    env: backendEnvironment,
    errors: {},
    body: { sliceId: SLICE_TO_DELETE_ID, libName: SLICE_TO_DELETE_LIBRARY },
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

  it("should delete and update all the slice files", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/model.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCK),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/mocks.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCKS),
      "/test/.slicemachine/mock-config.json": JSON.stringify(MOCK_CONFIG),
    });

    expect(readSliceFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readAssetsFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual({
      [SLICE_TO_DELETE_LIBRARY]: {
        [SLICE_TO_DELETE_NAME]: { name: SLICE_TO_DELETE_NAME },
        "slice-2": { name: "bar" },
      },
    });

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual([]);
    expect(readAssetsFiles()).toStrictEqual([]);
    expect(readMockConfig()).toStrictEqual({
      [SLICE_TO_DELETE_LIBRARY]: {
        "slice-2": { name: "bar" },
      },
    });
    expect(result).toStrictEqual({});
  });

  it("should log and return an error if the slices deletion fails", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/test.json`]: JSON.stringify({}),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/mocks.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCKS),
      "/test/.slicemachine/mock-config.json": JSON.stringify(MOCK_CONFIG),
    });

    expect(readSliceFiles()).toStrictEqual(["test.json"]);
    expect(readAssetsFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual(MOCK_CONFIG);

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual(["test.json"]);
    expect(readAssetsFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual(MOCK_CONFIG);

    expect(console.error).toHaveBeenCalledWith(
      `[slice/delete] When deleting slice: ${SLICE_TO_DELETE_ID}, the slice: ${SLICE_TO_DELETE_ID} was not found.`
    );
    expect(result).toStrictEqual({
      err: Error(
        `When deleting slice: ${SLICE_TO_DELETE_ID}, the slice: ${SLICE_TO_DELETE_ID} was not found.`
      ),
      reason: `When deleting slice: ${SLICE_TO_DELETE_ID}, the slice: ${SLICE_TO_DELETE_ID} was not found.`,
      status: 500,
      type: "error",
    });
  });

  it("should log and return a warning if the slice asset deletion fails", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/model.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCK),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/test.json`]: "",
      "/test/.slicemachine/mock-config.json": JSON.stringify(MOCK_CONFIG),
    });

    expect(readSliceFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readAssetsFiles()).toStrictEqual(["test.json"]);
    expect(readMockConfig()).toStrictEqual(MOCK_CONFIG);

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual([]);
    expect(readAssetsFiles()).toStrictEqual(["test.json"]);
    expect(readMockConfig()).toStrictEqual({
      [SLICE_TO_DELETE_LIBRARY]: {
        "slice-2": { name: "bar" },
      },
    });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      `[slice/delete] Could not delete your slice assets files.\n`,
      `To resolve this, manually delete the directory /test/.slicemachine/assets/slices/${SLICE_TO_DELETE_NAME}`
    );
    expect(result).toStrictEqual({
      err: {},
      reason:
        "Something went wrong when deleting your slice. Check your terminal.",
      status: 500,
      type: "warning",
    });
  });

  it("should log and return a warning if the mock-config update fails", async () => {
    vol.fromJSON({
      [`/test/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/model.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCK),
      [`/test/.slicemachine/assets/${SLICE_TO_DELETE_LIBRARY}/${SLICE_TO_DELETE_NAME}/mocks.json`]:
        JSON.stringify(SLICE_TO_DELETE_MOCKS),
      "/test/.slicemachine/mock-config.json": JSON.stringify({}),
    });

    expect(readSliceFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readAssetsFiles()).toStrictEqual([SLICE_TO_DELETE_NAME]);
    expect(readMockConfig()).toStrictEqual({});

    const result = await deleteSlice(mockRequest);

    expect(readSliceFiles()).toStrictEqual([]);
    expect(readAssetsFiles()).toStrictEqual([]);
    expect(readMockConfig()).toStrictEqual({});

    expect(console.error).toHaveBeenCalledWith(
      `[slice/delete] Could not delete your slice from the mock-config.json.\n`,
      `To resolve this, manually remove the ${SLICE_TO_DELETE_NAME} field in /test/.slicemachine/mock-config.json`
    );
    expect(console.error).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual({
      err: {},
      reason:
        "Something went wrong when deleting your slice. Check your terminal.",
      status: 500,
      type: "warning",
    });
  });
});

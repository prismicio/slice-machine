import { describe, test, beforeEach, expect, vi } from "vitest";
import { useModelStatus } from "../../../src/hooks/useModelStatus";
import * as networkHook from "../../../src/hooks/useNetwork";
import { AuthStatus } from "@src/modules/userContext/types";

import { Slices } from "@slicemachine/core/build/models/Slice";
import SliceMock from "../../__fixtures__/sliceModel";

import { CustomTypes } from "@slicemachine/core/build/models/CustomType";
import { customTypeMock } from "../../__fixtures__/customType";
import { ModelStatus } from "@lib/models/common/ModelStatus";

const mockSelector = vi.fn();
vi.mock("react-redux", async () => {
  const actual: typeof import("react-redux") = await vi.importActual(
    "react-redux"
  );

  return {
    ...actual,
    useSelector: () => mockSelector(),
  };
});

const sliceModel = Slices.toSM(SliceMock);
const customTypeModel = CustomTypes.toSM(customTypeMock);

describe("[useModelStatus hook]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("it should return the model status correctly", () => {
    vi.spyOn(networkHook, "useNetwork").mockImplementation(() => true); // isOnline
    mockSelector.mockReturnValue({ authStatus: AuthStatus.AUTHORIZED });

    const result = useModelStatus([
      { local: sliceModel, remote: sliceModel, localScreenshots: {} },
      { local: customTypeModel },
    ]);

    expect(result).toEqual({
      modelsStatuses: {
        slices: { [sliceModel.id]: ModelStatus.Synced },
        customTypes: { [customTypeModel.id]: ModelStatus.New },
      },
      authStatus: AuthStatus.AUTHORIZED,
      isOnline: true,
    });
  });

  test("it should return Unknown status is the user doesn't have internet", () => {
    vi.spyOn(networkHook, "useNetwork").mockImplementation(() => false); // isOnline
    mockSelector.mockReturnValue({ authStatus: AuthStatus.AUTHORIZED });

    const result = useModelStatus([
      { local: sliceModel, remote: sliceModel, localScreenshots: {} },
      { local: customTypeModel },
    ]);

    expect(result).toEqual({
      modelsStatuses: {
        slices: { [sliceModel.id]: ModelStatus.Unknown },
        customTypes: { [customTypeModel.id]: ModelStatus.Unknown },
      },
      authStatus: AuthStatus.AUTHORIZED,
      isOnline: false,
    });
  });

  test("it should return Unknown status is the user is not connected to Prismic", () => {
    vi.spyOn(networkHook, "useNetwork").mockImplementation(() => true); // isOnline
    mockSelector.mockReturnValue({ authStatus: AuthStatus.UNAUTHORIZED });

    const result = useModelStatus([
      { local: sliceModel, remote: sliceModel, localScreenshots: {} },
      { local: customTypeModel },
    ]);

    expect(result).toEqual({
      modelsStatuses: {
        slices: { [sliceModel.id]: ModelStatus.Unknown },
        customTypes: { [customTypeModel.id]: ModelStatus.Unknown },
      },
      authStatus: AuthStatus.UNAUTHORIZED,
      isOnline: true,
    });
  });

  test("it should return Unknown status is the user doesn't have access to the repository", () => {
    vi.spyOn(networkHook, "useNetwork").mockImplementation(() => true); // isOnline
    mockSelector.mockReturnValue({ authStatus: AuthStatus.FORBIDDEN });

    const result = useModelStatus([
      { local: sliceModel, remote: sliceModel, localScreenshots: {} },
      { local: customTypeModel },
    ]);

    expect(result).toEqual({
      modelsStatuses: {
        slices: { [sliceModel.id]: ModelStatus.Unknown },
        customTypes: { [customTypeModel.id]: ModelStatus.Unknown },
      },
      authStatus: AuthStatus.FORBIDDEN,
      isOnline: true,
    });
  });
});

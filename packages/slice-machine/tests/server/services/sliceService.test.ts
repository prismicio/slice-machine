import "@testing-library/jest-dom";

import { uploadScreenshots } from "../../../server/src/api/services/sliceService";
import { upload } from "../../../server/src/api/services/uploadScreenshotClient";

import allFieldSliceObject from "../../__mocks__/sliceModel";
import backendEnvironment from "../../__mocks__/backendEnvironment";
import { Slices } from "@slicemachine/core/build/models/Slice";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/libraries/screenshot";

const allFieldSliceModel = Slices.toSM(allFieldSliceObject);

jest.mock("@slicemachine/client", () => {
  const originalModule = jest.requireActual("@slicemachine/client");

  return {
    ...originalModule,
    Client: jest.fn().mockImplementation(() => {
      return {
        updateSlice: jest.fn(),
        insertSlice: jest.fn(),
      };
    }),
  };
});

jest.mock("@slicemachine/core/build/libraries/screenshot", () => {
  return {
    resolvePathsToScreenshot: jest.fn(),
  };
});

jest.mock("../../../server/src/api/services/uploadScreenshotClient", () => {
  return {
    upload: jest.fn(),
  };
});

describe("Slice Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadScreenshots", () => {
    test("should return a S3Url for every variation", async () => {
      const resolvePathsToScreenshotMock =
        resolvePathsToScreenshot as jest.Mock;
      const uploadMock = upload as jest.Mock;
      resolvePathsToScreenshotMock.mockImplementation(() => "screenshot/path");
      uploadMock.mockImplementation(() => ({
        s3ImageUrl: "s3ImageUrl",
      }));

      const result = await uploadScreenshots(
        backendEnvironment,
        allFieldSliceModel,
        allFieldSliceModel.name,
        "from"
      );

      expect(result).toStrictEqual({
        "default-slice": "s3ImageUrl",
        newVar: "s3ImageUrl",
      });
      expect(resolvePathsToScreenshotMock).toHaveBeenCalledTimes(2);
      expect(uploadMock).toHaveBeenCalledTimes(2);
    });
    test("should return null for every variation", async () => {
      jest.spyOn(console, "error").mockImplementation(() => void 0);

      const resolvePathsToScreenshotMock =
        resolvePathsToScreenshot as jest.Mock;
      const uploadMock = upload as jest.Mock;
      resolvePathsToScreenshotMock.mockImplementation(() => null);
      uploadMock.mockImplementation(() => ({
        s3ImageUrl: "s3ImageUrl",
      }));

      const result = await uploadScreenshots(
        backendEnvironment,
        allFieldSliceModel,
        allFieldSliceModel.name,
        "from"
      );

      expect(result).toStrictEqual({
        "default-slice": null,
        newVar: null,
      });
      expect(resolvePathsToScreenshotMock).toHaveBeenCalledTimes(2);
      expect(uploadMock).toHaveBeenCalledTimes(0);
    });
  });
});
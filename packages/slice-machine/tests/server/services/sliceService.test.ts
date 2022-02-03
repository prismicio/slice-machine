import "@testing-library/jest-dom";

import {
  createOrUpdate,
  uploadScreenshots,
} from "../../../server/src/api/services/sliceService";
import { upload } from "../../../server/src/api/services/uploadScreenshotClient";

import DefaultClient from "../../../lib/models/common/http/DefaultClient";
import { allFieldSliceModel } from "../../__mocks__/sliceModel";
import backendEnvironment from "../../__mocks__/backendEnvironment";
import { resolvePathsToScreenshot } from "@slicemachine/core/build/src/libraries/screenshot";

const mockUpdateSlice = jest.fn();
const mockInsertSlice = jest.fn();
jest.mock("../../../lib/models/common/http/DefaultClient", () => {
  return jest.fn().mockImplementation(() => {
    return {
      updateSlice: mockUpdateSlice,
      insertSlice: mockInsertSlice,
    };
  });
});

jest.mock("@slicemachine/core/build/src/libraries/screenshot", () => {
  return {
    resolvePathsToScreenshot: jest.fn(),
  };
});

jest.mock("../../../server/src/api/services/uploadScreenshotClient", () => {
  return {
    upload: jest.fn(),
  };
});

describe("createOrUpdate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrUpdate", () => {
    test("should call insert slice", async () => {
      const result = createOrUpdate(
        [],
        allFieldSliceModel.name,
        allFieldSliceModel,
        new DefaultClient("cwd", "base", "repo", "auth")
      );
      expect(mockInsertSlice).toHaveBeenCalledTimes(1);
      expect(mockInsertSlice).toHaveBeenCalledWith(allFieldSliceModel);
      expect(mockUpdateSlice).toHaveBeenCalledTimes(0);
    });

    test("should call update slice", async () => {
      const result = createOrUpdate(
        [allFieldSliceModel],
        allFieldSliceModel.name,
        allFieldSliceModel,
        new DefaultClient("cwd", "base", "repo", "auth")
      );
      expect(mockInsertSlice).toHaveBeenCalledTimes(0);
      expect(mockUpdateSlice).toHaveBeenCalledTimes(1);
      expect(mockUpdateSlice).toHaveBeenCalledWith(allFieldSliceModel);
    });
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

import { testSaga } from "redux-saga-test-plan";
import { generateSliceScreenshotSaga } from "@src/modules/screenshots/sagas";
import { getSelectedSliceDummyData } from "./utils";
import { generateSliceScreenshotCreator } from "../../../../src/modules/screenshots/actions";
import { generateSliceScreenshotApiClient } from "../../../../src/apiClient";
import {
  openToasterCreator,
  ToasterType,
} from "../../../../src/modules/toaster";

const { dummySliceState, dummyModelVariationID } = getSelectedSliceDummyData();

describe("[Selected Slice sagas]", () => {
  describe("[generateSliceScreenshotSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockSetData = jest.fn();
      const screenWidth = "200";
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          variationId: dummyModelVariationID,
          component: dummySliceState,
          setData: mockSetData,
          screenWidth,
        })
      );

      saga.next().call(generateSliceScreenshotApiClient, {
        sliceName: dummySliceState.model.name,
        libraryName: dummySliceState.from,
        variationId: dummyModelVariationID,
        screenWidth,
      });
      const response = {
        screenshots: {
          dummyModelVariationID: {
            path: "testScreenshotPath",
            url: "testScreenshotUrl",
          },
        },
      };

      saga
        .next({
          status: 200,
          data: response,
        })
        .put(
          generateSliceScreenshotCreator.success({
            screenshots: response.screenshots,
            component: dummySliceState,
          })
        );

      saga.next().isDone();
      expect(mockSetData).toHaveBeenCalledWith({
        done: true,
        error: null,
        loading: false,
        imageLoading: false,
        message: "Screenshots were saved to FileSystem",
        status: 200,
        warning: false,
      });
    });
    it("should open a error toaster on internal error", () => {
      const mockSetData = jest.fn();
      const screenWidth = "200";
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          variationId: dummyModelVariationID,
          component: dummySliceState,
          setData: mockSetData,
          screenWidth,
        })
      ).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          message: "Internal Error: Screenshot not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});

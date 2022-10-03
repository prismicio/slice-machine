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
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          variationId: dummyModelVariationID,
          component: dummySliceState,
        })
      );

      saga
        .next()
        .call(
          generateSliceScreenshotApiClient,
          dummySliceState.model.name,
          dummySliceState.from,
          dummyModelVariationID
        );
      const response = {
        screenshot: {
          path: "testScreenshotPath",
          hash: "testScreenshotHash",
          url: "testScreenshotUrl",
        },
      };

      saga
        .next({
          status: 200,
          data: response,
        })
        .put(
          generateSliceScreenshotCreator.success({
            screenshot: response.screenshot,
            component: dummySliceState,
          })
        );

      saga.next().isDone();
    });
    it("should open a error toaster on internal error", () => {
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          variationId: dummyModelVariationID,
          component: dummySliceState,
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

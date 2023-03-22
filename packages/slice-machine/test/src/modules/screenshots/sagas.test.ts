import { describe, it } from "vitest";
import { testSaga } from "redux-saga-test-plan";
import { generateSliceScreenshotSaga } from "@src/modules/screenshots/sagas";
import { generateSliceScreenshotCreator } from "@src/modules/screenshots/actions";
import { generateSliceScreenshotApiClient } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import SegmentClient from "analytics-node";

import { getSelectedSliceDummyData } from "./__testutils__/getSelectedSliceDummyData";

const { dummySliceState, dummyModelVariationID } = getSelectedSliceDummyData();

describe("[Selected Slice sagas]", () => {
  describe("[generateSliceScreenshotSaga]", () => {
    it("should call the api and dispatch the success action", async () => {
      const screenDimensions = { width: 1200, height: 600 };
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          variationId: dummyModelVariationID,
          component: dummySliceState,
          screenDimensions,
          method: "fromSimulator",
        })
      );

      saga.next().call(generateSliceScreenshotApiClient, {
        libraryName: dummySliceState.from,
        sliceId: dummySliceState.model.id,
        variationId: dummyModelVariationID,
        screenDimensions,
      });
      const response = {
        url: "testScreenshotUrl",
        errors: [],
      };

      saga.next(response).put(
        openToasterCreator({
          url: "testScreenshotUrl",
          type: ToasterType.SCREENSHOT_CAPTURED,
        })
      );

      saga.next().put(
        generateSliceScreenshotCreator.success({
          screenshot: {
            url: response.url,
          },
          component: dummySliceState,
          variationId: dummyModelVariationID,
        })
      );

      saga.next().isDone();

      // Wait for network request to be performed
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    });
    it("should open a error toaster on internal error", () => {
      const screenDimensions = { width: 1200, height: 600 };
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          variationId: dummyModelVariationID,
          component: dummySliceState,
          screenDimensions,
          method: "fromSimulator",
        })
      ).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          content: "Internal Error: Screenshot not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});

import { describe, it } from "vitest";
import { testSaga } from "redux-saga-test-plan";
import { generateSliceScreenshotSaga } from "@src/modules/screenshots/sagas";
import { getSelectedSliceDummyData } from "./__testutils__/getSelectedSliceDummyData";
import { generateSliceScreenshotCreator } from "@src/modules/screenshots/actions";
import { generateSliceScreenshotApiClient } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { rest } from "msw";

const { dummySliceState, dummyModelVariationID } = getSelectedSliceDummyData();

describe("[Selected Slice sagas]", () => {
  describe("[generateSliceScreenshotSaga]", () => {
    it("should call the api and dispatch the success action", (ctx) => {
      ctx.msw.use(rest.post("/api/s", (_req, res, ctx) => res(ctx.json({}))));

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
            path: "__TODO-REMOVE__",
            hash: "__TODO-REMOVE__",
          },
          component: dummySliceState,
          variationId: dummyModelVariationID,
        })
      );

      saga.next().isDone();
    });
    it("should open a error toaster on internal error", (ctx) => {
      ctx.msw.use(rest.post("/api/s", (_req, res, ctx) => res(ctx.json({}))));

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
          message: "Internal Error: Screenshot not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});

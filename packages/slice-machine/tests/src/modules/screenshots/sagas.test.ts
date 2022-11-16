import { testSaga } from "redux-saga-test-plan";
import { generateSliceScreenshotSaga } from "@src/modules/screenshots/sagas";
import { getSelectedSliceDummyData } from "./utils";
import { generateSliceScreenshotCreator } from "../../../../src/modules/screenshots/actions";
import { generateSliceScreenshotApiClient } from "../../../../src/apiClient";
import {
  openToasterCreator,
  ToasterType,
} from "../../../../src/modules/toaster";
import { setupServer } from "msw/lib/node";
import { rest, ResponseComposition, RestContext, RestRequest } from "msw";

const { dummySliceState, dummyModelVariationID } = getSelectedSliceDummyData();

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const makeTrackerSpy = () =>
  jest.fn((_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(ctx.json({}));
  });

const interceptTracker = (spy: ReturnType<typeof makeTrackerSpy>) =>
  server.use(rest.post("http://localhost/api/s", spy));

describe("[Selected Slice sagas]", () => {
  describe("[generateSliceScreenshotSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const fakeTracker = makeTrackerSpy();
      interceptTracker(fakeTracker); // warnings happen without this

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
        sliceName: dummySliceState.model.name,
        libraryName: dummySliceState.from,
        href: dummySliceState.href,
        variationId: dummyModelVariationID,
        screenDimensions,
      });
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
          openToasterCreator({
            url: "testScreenshotUrl",
            type: ToasterType.SCREENSHOT_CAPTURED,
          })
        );

      saga.next().put(
        generateSliceScreenshotCreator.success({
          screenshot: response.screenshot,
          component: dummySliceState,
          variationId: dummyModelVariationID,
        })
      );

      saga.next().isDone();
    });
    it("should open a error toaster on internal error", () => {
      const fakeTracker = makeTrackerSpy();
      interceptTracker(fakeTracker); // warnings happen without this

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

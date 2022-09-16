import { testSaga } from "redux-saga-test-plan";
import {
  saveSliceSaga,
  generateSliceScreenshotSaga,
} from "../../../../src/modules/selectedSlice/sagas";
import { getSelectedSliceDummyData } from "./utils";
import {
  generateSliceScreenshotCreator,
  saveSliceCreator,
} from "../../../../src/modules/selectedSlice/actions";
import {
  generateSliceScreenshotApiClient,
  saveSliceApiClient,
} from "../../../../src/apiClient";
import {
  openToasterCreator,
  ToasterType,
} from "../../../../src/modules/toaster";
import { setupServer } from "msw/node";
import { rest, RestContext, RestRequest, ResponseComposition } from "msw";
import { EventNames } from "../../../../src/tracking/types";

const { dummySliceState } = getSelectedSliceDummyData();

const server = setupServer();
beforeAll(() =>
  server.listen({
    onUnhandledRequest: "warn",
  })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

rest.post("/", (req, res) => {});

const makeTrackerSpy = () =>
  jest.fn((_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(ctx.json({}));
  });

const interceptTracker = (spy: ReturnType<typeof makeTrackerSpy>) =>
  server.use(rest.post("http://localhost/api/s", spy));

describe("[Selected Slice sagas]", () => {
  describe("[saveSliceSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockSetData = jest.fn();
      const saga = testSaga(
        saveSliceSaga,
        saveSliceCreator.request({
          component: dummySliceState,
          setData: mockSetData,
        })
      );

      saga.next().call(saveSliceApiClient, dummySliceState);

      saga
        .next({ status: 200, data: {} })
        .put(saveSliceCreator.success({ component: dummySliceState }));

      saga.next().isDone();
      expect(mockSetData).toHaveBeenCalledWith({
        done: true,
        error: null,
        loading: false,
        message: "Models & mocks have been generated successfully!",
        status: 200,
        warning: false,
      });
    });
    it("should open a error toaster on internal error", () => {
      const mockSetData = jest.fn();
      const saga = testSaga(
        saveSliceSaga,
        saveSliceCreator.request({
          component: dummySliceState,
          setData: mockSetData,
        })
      ).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          message: "Internal Error: Models & mocks not generated",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });

  describe("[generateSliceScreenshotSaga]", () => {
    it("should call the api and dispatch the success action", async () => {
      const mockSetData = jest.fn();
      const fakeTracker = makeTrackerSpy();
      interceptTracker(fakeTracker);

      const screenshotResponse = {
        screenshots: {
          dummyModelVariationID: {
            path: "testScreenshotPath",
            url: "testScreenshotUrl",
            hash: "xxx",
          },
        },
      };

      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          component: dummySliceState,
          setData: mockSetData,
        })
      );

      saga
        .next()
        .call(
          generateSliceScreenshotApiClient,
          dummySliceState.model.name,
          dummySliceState.from
        );
      const response = screenshotResponse;

      saga
        .next({
          status: 200,
          data: response,
        })
        .put(
          generateSliceScreenshotCreator.success({
            component: {
              ...dummySliceState,
              screenshots: screenshotResponse.screenshots,
            },
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

      await new Promise(process.nextTick);

      expect(fakeTracker).toHaveBeenCalled();
      const result = await fakeTracker.mock.calls[0][0].json();
      expect(result).toEqual({
        name: EventNames.ScreenshotTaken,
        props: { type: "automatic" },
      });
    });
    it("should open a error toaster on internal error", () => {
      const mockSetData = jest.fn();
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          component: dummySliceState,
          setData: mockSetData,
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

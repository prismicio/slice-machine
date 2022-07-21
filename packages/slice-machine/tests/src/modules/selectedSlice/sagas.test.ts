import { testSaga } from "redux-saga-test-plan";
import {
  pushSliceSaga,
  saveSliceSaga,
  generateSliceScreenshotSaga,
} from "@src/modules/selectedSlice/sagas";
import { getSelectedSliceDummyData } from "./utils";
import {
  generateSliceScreenshotCreator,
  pushSliceCreator,
  saveSliceCreator,
} from "../../../../src/modules/selectedSlice/actions";
import {
  generateSliceScreenshotApiClient,
  pushSliceApiClient,
  saveSliceApiClient,
} from "../../../../src/apiClient";
import {
  openToasterCreator,
  ToasterType,
} from "../../../../src/modules/toaster";
import { getLibrarySlice } from "@src/modules/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";

const { dummySliceState, dummyModelVariationID } = getSelectedSliceDummyData();

describe("[Selected Slice sagas]", () => {
  describe("[saveSliceSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockSetData = jest.fn();
      const saga = testSaga(
        saveSliceSaga,
        saveSliceCreator.request({
          extendedComponent: dummySliceState,
          setData: mockSetData,
        })
      );

      saga.next().call(saveSliceApiClient, dummySliceState);

      saga
        .next({ status: 200, data: {} })
        .select(
          getLibrarySlice,
          dummySliceState.component.from,
          dummySliceState.component.model.id
        );

      const librarySlice: ComponentUI = {
        ...dummySliceState.component,
        model: { ...dummySliceState.component.model, variations: [] },
      };

      saga.next(librarySlice).put(
        saveSliceCreator.success({
          extendedComponent: dummySliceState,
          librarySliceVariations: [],
        })
      );

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
          extendedComponent: dummySliceState,
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
  describe("[pushSliceSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockOnPush = jest.fn();
      const saga = testSaga(
        pushSliceSaga,
        pushSliceCreator.request({
          extendedComponent: dummySliceState,
          onPush: mockOnPush,
        })
      );

      saga.next().call(pushSliceApiClient, dummySliceState.component);

      saga
        .next({ status: 200, data: {} })
        .put(pushSliceCreator.success({ extendedComponent: dummySliceState }));

      saga.next().put(
        openToasterCreator({
          message: "Model was correctly saved to Prismic!",
          type: ToasterType.SUCCESS,
        })
      );

      saga.next().isDone();
      expect(mockOnPush).toHaveBeenCalledWith({
        done: true,
        error: null,
        imageLoading: false,
        loading: false,
        status: 200,
      });
    });
    it("should open a error toaster on internal error", () => {
      const mockOnPush = jest.fn();
      const saga = testSaga(
        pushSliceSaga,
        pushSliceCreator.request({
          extendedComponent: dummySliceState,
          onPush: mockOnPush,
        })
      ).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          message: "Internal Error: Slice was not pushed",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });

  describe("[generateSliceScreenshotSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockSetData = jest.fn();
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          _variationId: dummyModelVariationID,
          component: dummySliceState.component,
          setData: mockSetData,
        })
      );

      saga
        .next()
        .call(
          generateSliceScreenshotApiClient,
          dummySliceState.component.model.name,
          dummySliceState.component.from
        );
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
            component: dummySliceState.component,
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
      const saga = testSaga(
        generateSliceScreenshotSaga,
        generateSliceScreenshotCreator.request({
          _variationId: dummyModelVariationID,
          component: dummySliceState.component,
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

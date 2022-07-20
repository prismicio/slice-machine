import { testSaga } from "redux-saga-test-plan";
import { pushSliceSaga, saveSliceSaga } from "@src/modules/selectedSlice/sagas";
import { getSelectedSliceDummyData } from "./utils";
import {
  pushSliceCreator,
  saveSliceCreator,
} from "../../../../src/modules/selectedSlice/actions";
import {
  pushSliceApiClient,
  saveSliceApiClient,
} from "../../../../src/apiClient";
import {
  openToasterCreator,
  ToasterType,
} from "../../../../src/modules/toaster";

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
        .put(saveSliceCreator.success({ extendedComponent: dummySliceState }));

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
});

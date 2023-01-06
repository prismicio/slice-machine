import { describe, expect, it, vi } from "vitest";
import { testSaga } from "redux-saga-test-plan";
import { saveSliceSaga } from "@src/modules/selectedSlice/sagas";
import { saveSliceCreator } from "@src/modules/selectedSlice/actions";
import { saveSliceApiClient } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { getSelectedSliceDummyData } from "./__testutils__/getSelectedSliceDummyData";

const { dummySliceState } = getSelectedSliceDummyData();

describe("[Selected Slice sagas]", () => {
  describe("[saveSliceSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockSetData = vi.fn();
      const saga = testSaga(
        saveSliceSaga,
        saveSliceCreator.request({
          component: dummySliceState,
          setData: mockSetData,
        })
      );

      saga.next().call(saveSliceApiClient, dummySliceState);

      saga
        .next({ errors: [] })
        .put(saveSliceCreator.success({ component: dummySliceState }));

      saga.next().isDone();
      expect(mockSetData).toHaveBeenCalledWith({
        error: null,
        done: true,
        loading: false,
      });
    });
    it("should open a error toaster on internal error", () => {
      const mockSetData = vi.fn();
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
});

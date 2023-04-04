import { describe, expect, it, vi } from "vitest";
import { testSaga } from "redux-saga-test-plan";
import { updateSliceSaga } from "@src/modules/selectedSlice/sagas";
import { updateSliceCreator } from "@src/modules/selectedSlice/actions";
import { updateSliceApiClient } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { getSelectedSliceDummyData } from "./__testutils__/getSelectedSliceDummyData";

const { dummySliceState } = getSelectedSliceDummyData();

describe("[Selected Slice sagas]", () => {
  describe("[updateSliceSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockSetData = vi.fn();
      const saga = testSaga(
        updateSliceSaga,
        updateSliceCreator.request({
          component: dummySliceState,
          setData: mockSetData,
        })
      );

      saga.next().call(updateSliceApiClient, dummySliceState);

      saga
        .next({ errors: [] })
        .put(updateSliceCreator.success({ component: dummySliceState }));

      saga.next().isDone();
      expect(mockSetData).toHaveBeenCalledWith({
        error: null,
        done: true,
        loading: false,
        message: "Model saved",
      });
    });
    it("should open a error toaster on internal error", () => {
      const mockSetData = vi.fn();
      const saga = testSaga(
        updateSliceSaga,
        updateSliceCreator.request({
          component: dummySliceState,
          setData: mockSetData,
        })
      ).next();

      saga.throw(new Error()).put(
        openToasterCreator({
          content: "Internal Error: Models & mocks not generated",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});

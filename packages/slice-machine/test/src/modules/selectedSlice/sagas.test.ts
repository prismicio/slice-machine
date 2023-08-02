import { describe, expect, it, vi } from "vitest";
import { testSaga } from "redux-saga-test-plan";
import { updateSliceSaga } from "@src/modules/selectedSlice/sagas";
import { updateSliceCreator } from "@src/modules/selectedSlice/actions";
import { readSliceMocks, updateSliceApiClient } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { getSelectedSliceDummyData } from "./__testutils__/getSelectedSliceDummyData";

const { dummySliceState } = getSelectedSliceDummyData();

describe("[Selected Slice sagas]", () => {
  describe("[updateSliceSaga]", () => {
    it("should call the api and dispatch the success action", () => {
      const mockSetData = vi.fn<
        {
          error: boolean;
          done: boolean;
          loading: boolean;
          message: {
            props: {
              message: string;
              path: string;
            };
          };
        }[]
      >();
      const saga = testSaga(
        updateSliceSaga,
        updateSliceCreator.request({
          component: dummySliceState,
          setData: mockSetData,
        })
      );

      saga.next().call(updateSliceApiClient, dummySliceState);

      saga.next({ errors: [] }).call(readSliceMocks, {
        libraryID: dummySliceState.from,
        sliceID: dummySliceState.model.id,
      });

      saga.next({ errors: [], mocks: [] }).put(
        updateSliceCreator.success({
          component: { ...dummySliceState, mocks: [] },
        })
      );

      saga.next().isDone();

      const mockSetDataCalls = mockSetData.mock.lastCall?.[0];
      expect(mockSetDataCalls?.error).toBe(null);
      expect(mockSetDataCalls?.done).toBe(true);
      expect(mockSetDataCalls?.loading).toBe(false);
      expect(mockSetDataCalls?.message.props.message).toBe(
        "Slice saved successfully at "
      );
      expect(mockSetDataCalls?.message.props.path).toBe(
        "slices/libName/DummySlice/model.json"
      );
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

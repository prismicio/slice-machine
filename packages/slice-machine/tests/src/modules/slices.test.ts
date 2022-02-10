import "@testing-library/jest-dom";

import {
  slicesReducer,
  createSliceSaga,
  createSliceCreator,
} from "@src/modules/slices";
import { testSaga } from "redux-saga-test-plan";

import { saveSlice } from "@src/apiClient";
import { push } from "connected-next-router";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { SlicesStoreType } from "@src/modules/slices/types";

const dummySlicesState: SlicesStoreType = {
  libraries: [],
};

describe("[Slices module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(slicesReducer(dummySlicesState, {})).toEqual(dummySlicesState);
    });

    it("should return the initial state if no matching action", () => {
      expect(slicesReducer(dummySlicesState, { type: "NO.MATCH" })).toEqual(
        dummySlicesState
      );
    });
  });

  describe("[createSliceSaga]", () => {
    it("should call the api and dispatch the good actions", () => {
      const variationId = "variationId";
      const actionPayload = { sliceName: "MySlice", from: "MyLib/Components" };
      const saga = testSaga(
        createSliceSaga,
        createSliceCreator.request(actionPayload)
      );

      saga.next().call(saveSlice, actionPayload.sliceName, actionPayload.from);
      saga
        .next({ variationId })
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
      saga.next().put(push("/MyLib--Components/MySlice/variationId"));
      saga.next().isDone();
    });
  });
});

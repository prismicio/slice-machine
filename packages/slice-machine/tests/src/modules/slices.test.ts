/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import {
  slicesReducer,
  createSliceSaga,
  createSliceCreator,
} from "@src/modules/slices";
import { testSaga } from "redux-saga-test-plan";

import { createSlice, getState } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { SlicesStoreType } from "@src/modules/slices/types";
import { LOCATION_CHANGE, replace } from "connected-next-router";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";

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
      jest.spyOn(console, "error").mockImplementationOnce(() => undefined);

      const variationId = "variationId";
      const actionPayload = {
        sliceName: "MySlice",
        libName: "MyLib/Components",
      };
      const serverState = { libraries: [] };
      const saga = testSaga(
        createSliceSaga,
        createSliceCreator.request(actionPayload)
      );

      saga
        .next()
        .call(createSlice, actionPayload.sliceName, actionPayload.libName);
      saga.next({ variationId }).call(getState);
      saga
        .next({ data: serverState })
        .put(createSliceCreator.success({ libraries: serverState.libraries }));
      saga
        .next()
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
      saga
        .next()
        .put(
          replace(
            "/[lib]/[sliceName]/[variation]",
            "/MyLib--Components/MySlice/variationId"
          )
        );
      saga.next().take(LOCATION_CHANGE);
      saga.next().put(
        openToasterCreator({
          message: "Slice saved",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();
    });
  });
});

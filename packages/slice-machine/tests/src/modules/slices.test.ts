/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import {
  slicesReducer,
  createSliceSaga,
  createSliceCreator,
  renameScreenshotPaths,
  renameScreenshotUrls,
  renameModel,
} from "@src/modules/slices";
import { testSaga } from "redux-saga-test-plan";

import { createSlice, getState } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { SlicesStoreType } from "@src/modules/slices/types";
import { LOCATION_CHANGE, push } from "connected-next-router";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { Screenshot, SliceSM } from "@slicemachine/core/build/models";
import { Screenshots } from "@lib/models/common/Screenshots";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

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
          push(
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

describe("[utils]", () => {
  const PREV_NAME = "SliceName";
  const NEW_NAME = "SliceRenamed";
  it("test renameScreenshotPaths", () => {
    const initialPaths: Record<string, Screenshot> = {
      "default-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${PREV_NAME}/default-variation/preview.png`,
      },
      "other-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${PREV_NAME}/other-variation/preview.png`,
      },
    };
    const expectedRenamedPaths: Record<string, Screenshot> = {
      "default-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${NEW_NAME}/default-variation/preview.png`,
      },
      "other-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${NEW_NAME}/other-variation/preview.png`,
      },
    };
    expect(renameScreenshotPaths(initialPaths, PREV_NAME, NEW_NAME)).toEqual(
      expectedRenamedPaths
    );
  });

  it("test renameScreenshotUrls", () => {
    const initialUrls: Screenshots = {
      "default-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${PREV_NAME}/default-variation/preview.png`,
        url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${PREV_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
      },
      "other-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${PREV_NAME}/other-variation/preview.png`,
        url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${PREV_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
      },
    };
    const expectedRenamedUrls: Screenshots = {
      "default-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${NEW_NAME}/default-variation/preview.png`,
        url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${NEW_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
      },
      "other-variation": {
        path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${NEW_NAME}/other-variation/preview.png`,
        url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${NEW_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
      },
    };
    expect(renameScreenshotUrls(initialUrls, PREV_NAME, NEW_NAME)).toEqual(
      expectedRenamedUrls
    );
  });
  it("test renameModel", () => {
    const initialModel: SliceSM = {
      id: "slice_id",
      name: PREV_NAME,
      type: SlicesTypes.SharedSlice,
      variations: [],
    };
    const expectedModel: SliceSM = {
      id: "slice_id",
      name: NEW_NAME,
      type: SlicesTypes.SharedSlice,
      variations: [],
    };
    expect(renameModel(initialModel, NEW_NAME)).toEqual(expectedModel);
  });
});

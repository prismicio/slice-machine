// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import {
  slicesReducer,
  createSliceSaga,
  createSliceCreator,
  deleteSliceCreator,
  // getFrontendSlices,
  // deleteSliceSaga,
} from "@src/modules/slices";
import { testSaga } from "redux-saga-test-plan";
import SegmentClient from "analytics-node";

import { createSlice, getState } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { SlicesStoreType } from "@src/modules/slices/types";
import { LOCATION_CHANGE, push } from "connected-next-router";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { LibraryUI } from "@lib/models/common/LibraryUI";
// import { generateComponentUI, generateLibraryUI, generateSliceSM } from "./__fixtures__/sliceUtilsFactory";
// import { SliceMachineStoreType } from "@src/redux/type";

const dummySlicesState: SlicesStoreType = {
  libraries: [],
  remoteSlices: [],
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

    it("should update the slice state given SLICES/DELETE.SUCCESS action", () => {
      const sliceIdToDelete = "id";
      const sliceNameToDelete = "slice-name";
      const libName = "libName";

      const originalState = { ...dummySlicesState };

      originalState["libraries"] = [
        {
          name: libName,
          isLocal: true,
          components: [
            { model: { id: sliceIdToDelete } },
            { model: { id: "second-slice" } },
          ],
        },
      ] as unknown as LibraryUI[];

      const action = deleteSliceCreator.success({
        sliceId: sliceIdToDelete,
        libName,
        sliceName: sliceNameToDelete,
      });

      const result = slicesReducer(originalState, action);

      const expectState = { ...originalState };
      expectState["libraries"] = [
        {
          name: libName,
          isLocal: true,
          components: [{ model: { id: "second-slice" } }],
        },
      ] as unknown as LibraryUI[];

      expect(result).toEqual(expectState);
    });
  });

  describe("[createSliceSaga]", () => {
    it("should call the api and dispatch the good actions", async () => {
      vi.spyOn(console, "error").mockImplementationOnce(() => undefined);

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
      saga.next({ variationId, errors: [] }).call(getState);
      saga
        .next(serverState)
        .put(createSliceCreator.success({ libraries: serverState.libraries }));
      saga.next().put(modalCloseCreator());
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
          content: "Slice saved",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();

      // Wait for network request to be performed
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    });
  });

  // describe("[renameSliceSaga]", () => {
  //   it("should call the api and dispatch the good actions", () => {
  //     const actionPayload = {
  //       sliceId: "MySlice",
  //       libName: "MyLib/Components",
  //       newSliceName: "MyNewSlice",
  //     };
  //     const saga = testSaga(
  //       renameSliceSaga,
  //       renameSliceCreator.request(actionPayload)
  //     );

  //     saga
  //       .next()
  //       .call(
  //         renameSlice,
  //         actionPayload.sliceId,
  //         actionPayload.newSliceName,
  //         actionPayload.libName
  //       );
  //     saga.next().put(
  //       renameSliceCreator.success({
  //         libName: actionPayload.libName,
  //         sliceId: actionPayload.sliceId,
  //         newSliceName: actionPayload.newSliceName,
  //       })
  //     );
  //     saga.next().put(modalCloseCreator());
  //     saga.next().put(
  //       openToasterCreator({
  //         content: "Slice name updated",
  //         type: ToasterType.SUCCESS,
  //       })
  //     );
  //     saga.next().isDone();
  //   });
  // });

  // describe("[deleteCustomTypeSaga]", () => {
  //   it("should call the api and dispatch the good actions on success", () => {
  //     const actionPayload = {
  //       sliceId: "id",
  //       sliceName: "name",
  //       libName: "lib",
  //     };
  //     const saga = testSaga(
  //       deleteSliceSaga,
  //       deleteSliceCreator.request(actionPayload)
  //     );

  //     saga
  //       .next()
  //       .call(deleteSlice, actionPayload.sliceId, actionPayload.libName);
  //     saga.next().put(deleteSliceCreator.success(actionPayload));
  //     saga.next().put(
  //       openToasterCreator({
  //         content: `Successfully deleted Slice “${actionPayload.sliceName}”`,
  //         type: ToasterType.SUCCESS,
  //       })
  //     );

  //     saga.next().put(modalCloseCreator());
  //     saga.next().isDone();
  //   });
  //   it("should call the api and dispatch the good actions on unknown failure", () => {
  //     const actionPayload = {
  //       sliceId: "id",
  //       sliceName: "name",
  //       libName: "lib",
  //     };
  //     const saga = testSaga(
  //       deleteSliceSaga,
  //       deleteSliceCreator.request(actionPayload)
  //     );

  //     saga
  //       .next()
  //       .call(deleteSlice, actionPayload.sliceId, actionPayload.libName);
  //     saga.throw(new Error()).put(
  //       openToasterCreator({
  //         content: "An unexpected error happened while deleting your slice.",
  //         type: ToasterType.ERROR,
  //       })
  //     );

  //     saga.next().put(modalCloseCreator());
  //     saga.next().isDone();
  //   });
  //   it("should call the api and dispatch the good actions on an API error", () => {
  //     const actionPayload = {
  //       sliceId: "id",
  //       sliceName: "name",
  //       libName: "lib",
  //     };
  //     const saga = testSaga(
  //       deleteSliceSaga,
  //       deleteSliceCreator.request(actionPayload)
  //     );

  //     jest.spyOn(axios, "isAxiosError").mockImplementation(() => true);

  //     const err = Error() as AxiosError;
  //     // @ts-expect-error Ignoring the type error since we only need these properties to test
  //     err.response = {
  //       data: { reason: "Could not delete Slice", type: "error" },
  //     };

  //     saga
  //       .next()
  //       .call(deleteSlice, actionPayload.sliceId, actionPayload.libName);
  //     saga.throw(err).put(
  //       openToasterCreator({
  //         content: "Could not delete Slice",
  //         type: ToasterType.ERROR,
  //       })
  //     );

  //     saga.next().put(modalCloseCreator());
  //     saga.next().isDone();
  //   });
  //   it("should call the api and dispatch the good actions on an API warning", () => {
  //     const actionPayload = {
  //       sliceId: "id",
  //       sliceName: "name",
  //       libName: "lib",
  //     };
  //     const saga = testSaga(
  //       deleteSliceSaga,
  //       deleteSliceCreator.request(actionPayload)
  //     );

  //     jest.spyOn(axios, "isAxiosError").mockImplementation(() => true);

  //     const err = Error() as AxiosError;
  //     // @ts-expect-error Ignoring the type error since we only need these properties to test
  //     err.response = {
  //       data: { reason: "Could not delete Slice", type: "warning" },
  //     };

  //     saga
  //       .next()
  //       .call(deleteSlice, actionPayload.sliceId, actionPayload.libName);
  //     saga.throw(err).put(deleteSliceCreator.success(actionPayload));
  //     saga.next().put(
  //       openToasterCreator({
  //         content: "Could not delete Slice",
  //         type: ToasterType.WARNING,
  //       })
  //     );

  //     saga.next().put(modalCloseCreator());
  //     saga.next().isDone();
  //   });
  // });

  // describe("[Selectors]", () => {
  //   describe.only("getLocallyDeletedSlices", () => {
  //     it("works as expected", () => {
  //       const l1 = generateLibraryUI({
  //         components: [
  //           generateComponentUI({
  //             model: generateSliceSM({ id: "1" }),
  //           }),
  //           generateComponentUI({
  //             model: generateSliceSM({ id: "2" }),
  //           }),
  //           generateComponentUI({
  //             model: generateSliceSM({ id: "3" }),
  //           }),
  //         ],
  //       });
  //       const l2 = generateLibraryUI({
  //         components: [
  //           generateComponentUI({
  //             model: generateSliceSM({ id: "4" }),
  //           }),
  //           generateComponentUI({
  //             model: generateSliceSM({ id: "5" }),
  //           }),
  //         ],
  //       });

  //       const remoteSlices = [
  //         generateSliceSM({ id: "1" }),
  //         generateSliceSM({ id: "3" }),
  //         generateSliceSM({ id: "4" }),
  //         generateSliceSM({ id: "6" }),
  //       ];

  //       const frontendSlices = getFrontendSlices({
  //         slices: { libraries: [l1, l2], remoteSlices },
  //       } as unknown as SliceMachineStoreType);

  //       // it combines slices from all the local libraries
  //       // it combines local and remote only libraries
  //       // it maps the correct remote slice if found
  //       expect(frontendSlices.length).toEqual(6);
  //       expect(frontendSlices.map((s) => s.local?.id)).toEqual([
  //         "1",
  //         "2",
  //         "3",
  //         "4",
  //         "5",
  //         undefined,
  //       ]);
  //       expect(frontendSlices.map((s) => s.remote?.id)).toEqual([
  //         "1",
  //         undefined,
  //         "3",
  //         "4",
  //         undefined,
  //         "6",
  //       ]);
  //     });
  //   });
  // });
});

// describe("[utils]", () => {
//   const PREV_NAME = "SliceName";
//   const NEW_NAME = "SliceRenamed";
//   it("test renameScreenshots", () => {
//     const initialPaths: Record<string, ScreenshotUI> = {
//       "default-variation": createScreenshotUI(PREV_NAME, "default-variation"),
//       "other-variation": createScreenshotUI(PREV_NAME, "other-variation"),
//     };
//     const expectedRenamedPaths: Record<string, ScreenshotUI> = {
//       "default-variation": createScreenshotUI(NEW_NAME, "default-variation"),
//       "other-variation": createScreenshotUI(NEW_NAME, "other-variation"),
//     };
//     expect(renameScreenshots(initialPaths, PREV_NAME, NEW_NAME)).toEqual(
//       expectedRenamedPaths
//     );
//   });

//   it("test renameScreenshotUrls", () => {
//     const initialUrls: Screenshots = {
//       "default-variation": {
//         hash: "xxx",
//         path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${PREV_NAME}/default-variation/preview.png`,
//         url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${PREV_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
//       },
//       "other-variation": {
//         hash: "xxx",
//         path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${PREV_NAME}/other-variation/preview.png`,
//         url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${PREV_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
//       },
//     };
//     const expectedRenamedUrls: Screenshots = {
//       "default-variation": {
//         hash: "xxx",
//         path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${NEW_NAME}/default-variation/preview.png`,
//         url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${NEW_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
//       },
//       "other-variation": {
//         hash: "xxx",
//         path: `../../e2e-projects/next/.slicemachine/assets/slices/ecommerce/${NEW_NAME}/other-variation/preview.png`,
//         url: `http://localhost:9999/api/__preview?q=..%2F..%2Fe2e-projects%2Fnext%2F.slicemachine%2Fassets%2Fslices%2Fecommerce%2F${NEW_NAME}%2Fdefault-slice%2Fpreview.png&uniq=0.39230892472268586`,
//       },
//     };
//     expect(renameScreenshots(initialUrls, PREV_NAME, NEW_NAME)).toEqual(
//       expectedRenamedUrls
//     );
//   });
//   it("test renameModel", () => {
//     const initialModel: SliceSM = {
//       id: "slice_id",
//       name: PREV_NAME,
//       type: SlicesTypes.SharedSlice,
//       variations: [],
//     };
//     const expectedModel: SliceSM = {
//       id: "slice_id",
//       name: NEW_NAME,
//       type: SlicesTypes.SharedSlice,
//       variations: [],
//     };
//     expect(renameModel(initialModel, NEW_NAME)).toEqual(expectedModel);
//   });
// });

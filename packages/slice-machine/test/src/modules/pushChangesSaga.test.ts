// // @vitest-environment jsdom

// import { describe, test, expect, vi } from "vitest";
// import { expectSaga } from "redux-saga-test-plan";
// import { CustomTypeSM } from "@lib/models/common/CustomType";

// import {
//   pushCustomTypeCreator,
//   pushSliceCreator,
// } from "@src/modules/pushChangesSaga/actions";
// import { rest } from "msw";
// import { ApiError } from "@src/models/ApiError";
// import { ModelStatus } from "@lib/models/common/ModelStatus";
// import { ModelStatusInformation } from "@src/hooks/useModelStatus";
// import { EventNames } from "@src/tracking/types";
// import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
// import {
//   changesPushSaga,
//   changesPushCreator,
// } from "@src/modules/pushChangesSaga";
// import {
//   PUSH_CHANGES_TOASTER_ID,
//   syncChangesToasterMessage,
// } from "@src/modules/pushChangesSaga/syncToaster";
// import { ComponentUI } from "@lib/models/common/ComponentUI";
// import {
//   closeToasterCreator,
//   openToasterCreator,
//   ToasterType,
//   updateToasterCreator,
// } from "@src/modules/toaster";
// import { modalOpenCreator } from "@src/modules/modal";
// import { ModalKeysEnum } from "@src/modules/modal/types";
// import { pushCustomType, pushSliceApiClient } from "@src/apiClient";
// import { createTestPlugin } from "test/__testutils__/createTestPlugin";
// import { createTestProject } from "test/__testutils__/createTestProject";
// import { createSliceMachineManager } from "@slicemachine/manager";
// import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
// import { mockPrismicUserAPI } from "test/__testutils__/mockPrismicUserAPI";
// import { mockPrismicAuthAPI } from "test/__testutils__/mockPrismicAuthAPI";
// import { createPrismicAuthLoginResponse } from "test/__testutils__/createPrismicAuthLoginResponse";
// import { mockCustomTypesAPI } from "test/__testutils__/mockCustomTypesAPI";
// import { mockAWSACLAPI } from "test/__testutils__/mockAWSACLAPI";
// import { customTypeMock } from "../../__fixtures__/customType";
// import sliceModelMock from "../../__fixtures__/sliceModel";

// class CustomAxiosError extends Error {
//   isAxiosError: boolean;
//   response?: {
//     data: any;
//     status: number;
//     statusText?: string;
//     headers?: any;
//     config?: any;
//   };

//   constructor(status: number) {
//     super();
//     this.isAxiosError = true;
//     this.response = { data: {}, status };
//   }
// }

// // Delay before the saga test timesout, usefull as we have a delay in between slice push
// const sagaTimeout = 3000;

// describe.skip("[pashSaga module]", () => {
//   describe("[changesPushSaga]", () => {
//     test("pushes slices and custom types", async (ctx) => {
//       const adapter = createTestPlugin({
//         setup: ({ hook }) => {
//           hook("slice:read", () => {
//             return { model: sliceModelMock };
//           });
//           hook("slice:update", () => void 0);
//           hook("custom-type:read", () => {
//             return { model: customTypeMock };
//           });
//         },
//       });
//       const cwd = await createTestProject({ adapter });
//       const manager = createSliceMachineManager({
//         nativePlugins: { [adapter.meta.name]: adapter },
//         cwd,
//       });

//       await manager.plugins.initPlugins();

//       ctx.msw.use(
//         createSliceMachineManagerMSWHandler({
//           url: "http://localhost:3000/_manager",
//           sliceMachineManager: manager,
//         })
//       );

//       const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
//         (_req, res, ctx) => res(ctx.json({}))
//       );
//       ctx.msw.use(rest.post("/api/s", trackingSpy));

//       mockPrismicUserAPI(ctx);
//       mockPrismicAuthAPI(ctx);

//       await manager.user.login(createPrismicAuthLoginResponse());

//       const authenticationToken = await manager.user.getAuthenticationToken();
//       const sliceMachineConfig = await manager.project.getSliceMachineConfig();

//       mockCustomTypesAPI(ctx, {
//         async onSliceGet(_req, res, ctx) {
//           return res(ctx.status(404));
//         },
//         async onSliceInsert(_req, res, ctx) {
//           return res(ctx.status(201));
//         },
//         async onCustomTypeGet(_req, res, ctx) {
//           return res(ctx.status(404));
//         },
//         async onCustomTypeInsert(_req, res, ctx) {
//           return res(ctx.status(201));
//         },
//       });
//       mockAWSACLAPI(ctx, {
//         createEndpoint: {
//           expectedPrismicRepository: sliceMachineConfig.repositoryName,
//           expectedAuthenticationToken: authenticationToken,
//         },
//         uploadEndpoint: {
//           expectedUploads: [],
//         },
//       });

//       const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
//       const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
//       const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
//         slices: {
//           [stubSlice.model.id]: ModelStatus.Modified,
//         },
//         customTypes: {
//           [stubCustomType.id]: ModelStatus.New,
//         },
//       };
//       const onChangesPushed = vi.fn();
//       const handleError = vi.fn();

//       const payload = changesPushCreator({
//         unSyncedSlices,
//         unSyncedCustomTypes,
//         modelStatuses,
//         onChangesPushed,
//         handleError,
//       });

//       saga
//         .next({
//           status: 200,
//           data: null,
//         })
//         .call(getState);

//       saga
//         .next({
//           status: 200,
//           data: dummyServerState,
//         })
//         .put(
//           refreshStateCreator({
//             env: dummyServerState.env,
//             remoteCustomTypes: dummyServerState.remoteCustomTypes,
//             localCustomTypes: dummyServerState.customTypes,
//             libraries: dummyServerState.libraries,
//             remoteSlices: [],
//             clientError: undefined,
//           })
//         );

//       saga.next().put(changesPushCreator.success());

//       const endTime = Date.now();

//       const moreThanTotalTime = endTime - stateTime;

//       const trackerResult = await trackingSpy.mock.calls[0][0].json();
//       expect(trackerResult.name).toEqual(EventNames.ChangesPushed);
//       expect(trackerResult.props.customTypesCreated).toEqual(1);
//       expect(trackerResult.props.customTypesModified).toEqual(0);
//       expect(trackerResult.props.customTypesDeleted).toEqual(0);
//       expect(trackerResult.props.slicesCreated).toEqual(0);
//       expect(trackerResult.props.slicesModified).toEqual(1);
//       expect(trackerResult.props.slicesDeleted).toEqual(0);
//       expect(trackerResult.props.total).toEqual(2);
//       expect(trackerResult.props.errors).toEqual(0);
//       expect(trackerResult.props.duration).toBeGreaterThan(10);
//       expect(trackerResult.props.duration).toBeLessThanOrEqual(
//         moreThanTotalTime
//       );

//       saga.next().isDone();
//     });

//     test.each([
//       [LimitType.HARD, ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER],
//       [LimitType.SOFT, ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER],
//     ])(
//       "Displays delete limit modal when there is a %s limit response",
//       (limitType, expectedModalKey) => {
//         const fakeTracker = makeTrackerSpy();
//         interceptTracker(fakeTracker); // warnings happen without this

//       const onChangesPushed = vi.fn();
//       const handleError = vi.fn();
//       const trackerSpy = makeTrackerSpy();
//       interceptTracker(trackerSpy);

//       server.use(
//         rest.get("/api/slices/push", (_req, res, ctx) => {
//           return res(ctx.status(403));
//         })
//       );

//       const payload = changesPushCreator({
//         unSyncedSlices,
//         unSyncedCustomTypes,
//         modelStatuses,
//         onChangesPushed,
//         handleError,
//       });
//       const saga = expectSaga(changesPushSaga, payload);

//       await saga
//         .put(
//           openToasterCreator({
//             message: syncChangesToasterMessage(0, 2),
//             type: ToasterType.LOADING,
//             options: {
//               autoClose: false,
//               toastId: PUSH_CHANGES_TOASTER_ID,
//             },
//           })
//         )
//         .call(pushSliceApiClient, stubSlice)
//         .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
//         .not.call(pushCustomType, stubCustomType)
//         .run(sagaTimeout)
//         .then(() => {
//           expect(handleError).not.toHaveBeenCalled();
//         });

//         // This test will also verify that the details are sorted in descending order.
//         saga
//           .next({
//             status: 200,
//             data: {
//               type: limitType,
//               details: {
//                 customTypes: [
//                   {
//                     id: "CT1",
//                     numberOfDocuments: 2000,
//                     url: "url",
//                   },
//                   {
//                     id: "CT2",
//                     numberOfDocuments: 3000,
//                     url: "url",
//                   },
//                 ],
//               },
//             },
//           })
//           .put(
//             changesPushCreator.failure({
//               type: limitType,
//               details: {
//                 customTypes: [
//                   {
//                     id: "CT2",
//                     numberOfDocuments: 3000,
//                     url: "url",
//                   },
//                   {
//                     id: "CT1",
//                     numberOfDocuments: 2000,
//                     url: "url",
//                   },
//                 ],
//               },
//             })
//           );

//         saga.next().put(
//           modalOpenCreator({
//             modalKey: expectedModalKey,
//           })
//         );

//     test("when there's a 403 error while pushing a custom type it should stop", async () => {
//       const unSyncedSlices: ReadonlyArray<ComponentUI> = [];
//       const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
//       const onChangesPushed = vi.fn();
//       const handleError = vi.fn();

//     it("Displays an error toaster when there is an API error on push", () => {
//       saga.next().call(pushChanges, {
//         confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
//       });

//       saga.throw(new Error()).put(
//         openToasterCreator({
//           content:
//             "Something went wrong when pushing your changes. Check your terminal logs.",
//           type: ToasterType.ERROR,
//         })
//       );

//       saga.next().isDone();
//     });

//     test.each([[401], [403]])(
//       "when there's a %s error while pushing a slice it should stop and open the login model",
//       (errorCode) => {
//         saga.next().call(pushChanges, {
//           confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
//         });

//         const customError = new CustomAxiosError(errorCode);

//         saga
//           .throw(customError)
//           .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));

//         saga.next().isDone();
//       }
//     );

//     it("when there's INVALID_CUSTOM_TYPES response, open the references drawer", () => {
//       saga.next().call(pushChanges, {
//         confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
//       });

//       saga
//         .next({
//           status: 200,
//           data: {
//             type: "INVALID_CUSTOM_TYPES",
//             details: {
//               customTypes: [{ id: "CT1" }, { id: "CT2" }],
//             },
//           },
//           {}
//         ),
//         customTypes: unSyncedCustomTypes.reduce<Record<string, ModelStatus>>(
//           (acc, ct) => {
//             acc[ct.id] = ModelStatus.New;
//             return acc;
//           },
//           {}
//         ),
//       };
//       const onChangesPushed = vi.fn();
//       const handleError = vi.fn();
//       const trackerSpy = makeTrackerSpy();
//       interceptTracker(trackerSpy);

//       server.use(
//         rest.get("http://localhost/api/slices/push", (_req, res, ctx) => {
//           const sliceName = _req.url.searchParams.get("sliceName");
//           // will fail for Slice one
//           if (sliceName === stubSlice.model.name) return res(ctx.status(400));
//           return res(ctx.json({}));
//         }),
//         rest.get("http://localhost/api/custom-types/push", (_req, res, ctx) => {
//           return res(ctx.json({}));
//         })
//         .put(
//           changesPushCreator.failure({
//             type: "INVALID_CUSTOM_TYPES",
//             details: {
//               customTypes: [{ id: "CT1" }, { id: "CT2" }],
//             },
//           })
//         );

//       await new Promise(process.nextTick);

//       expect(trackerSpy).toHaveBeenCalled();
//       const trackerResult = await trackerSpy.mock.calls[0][0].json();
//       expect(trackerResult.name).toEqual(EventNames.ChangesPushed);
//       expect(trackerResult.props.errors).toEqual(1);
//       expect(trackerResult.props.slicesCreated).toEqual(2);
//       expect(trackerResult.props.customTypesCreated).toEqual(0);
//       expect(trackerResult.props.total).toEqual(4);
//     });

//     test("when pushing slices, if there an unexpected error it should not push custom-types", async () => {
//       const unSyncedSlices: ReadonlyArray<ComponentUI> = [
//         stubSlice,
//         stubSlice2,
//       ];
//       const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
//       const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
//         slices: {
//           [stubSlice.model.id]: ModelStatus.New,
//           [stubSlice2.model.id]: ModelStatus.New,
//         },
//         customTypes: {
//           [stubCustomType.id]: ModelStatus.New,
//         },
//       };
//       const onChangesPushed = vi.fn();
//       const handleError = vi.fn();
//       const trackerSpy = makeTrackerSpy();
//       interceptTracker(trackerSpy);

//       server.use(
//         rest.get("/api/slices/push", (_req, res, ctx) => {
//           return res(ctx.status(500));
//         }),
//         rest.get("/api/custom-types/push", (_req, res, ctx) => {
//           return res(ctx.json({}));
//         })
//       );

//       const payload = changesPushCreator({
//         unSyncedSlices,
//         unSyncedCustomTypes,
//         modelStatuses,
//         onChangesPushed,
//         handleError,
//       });
//       const saga = expectSaga(changesPushSaga, payload);

//       await saga
//         .put(
//           openToasterCreator({
//             message: syncChangesToasterMessage(0, 3),
//             type: ToasterType.LOADING,
//             options: {
//               autoClose: false,
//               toastId: PUSH_CHANGES_TOASTER_ID,
//             },
//           })
//         )
//         .call(pushSliceApiClient, stubSlice)
//         .call(pushSliceApiClient, stubSlice2)
//         .put(
//           closeToasterCreator({
//             toasterId: PUSH_CHANGES_TOASTER_ID,
//           })
//         )
//         .put(pushSliceCreator.failure({ component: stubSlice })) // We can't expect a success only a failure as it cancels the saga // or can we?
//         .not.put(
//           pushSliceCreator.success({
//             component: stubSlice2,
//             updatedScreenshotsUrls: {},
//           })
//         )
//         .not.put(pushSliceCreator.failure({ component: stubSlice2 }))
//         .not.call(pushCustomType, stubCustomType.id)
//         .not.put(
//           openToasterCreator({
//             message: "All slices and custom types have been pushed",
//             type: ToasterType.SUCCESS,
//           })
//         )
//         .run(sagaTimeout)
//         .then(() => {
//           expect(handleError).not.toHaveBeenCalled();
//         });

//       await new Promise(process.nextTick);

//       expect(trackerSpy).not.toHaveBeenCalled();
//     });

//     test("when one slice fails with a 400 status the others should be pushed", async () => {
//       const unSyncedSlices: ReadonlyArray<ComponentUI> = [
//         stubSlice,
//         stubSlice2,
//         stubSlice3,
//       ];
//       const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
//       const onChangesPushed = vi.fn();
//       const handleError = vi.fn();
//       const trackerSpy = makeTrackerSpy();
//       interceptTracker(trackerSpy);

//       const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
//         slices: unSyncedSlices.reduce<Record<string, ModelStatus>>(
//           (acc, curr) => {
//             acc[curr.model.id] = ModelStatus.Modified;
//             return acc;
//           },
//           {}
//         ),
//         customTypes: unSyncedCustomTypes.reduce<Record<string, ModelStatus>>(
//           (acc, curr) => {
//             acc[curr.id] = ModelStatus.New;
//             return acc;
//           },
//           {}
//         ),
//       };

//       server.use(
//         rest.get("/api/slices/push", (_req, res, ctx) => {
//           const sliceName = _req.url.searchParams.get("sliceName");
//           // will fail for Slice one
//           if (sliceName === stubSlice.model.name) return res(ctx.status(400));
//           return res(ctx.json({}));
//         })
//       );

//       const payload = changesPushCreator({
//         unSyncedSlices,
//         unSyncedCustomTypes,
//         modelStatuses,
//         onChangesPushed,
//         handleError,
//       });
//       const saga = expectSaga(changesPushSaga, payload);

//       await saga
//         .call(pushSliceApiClient, stubSlice)
//         .call(pushSliceApiClient, stubSlice2)
//         .call(pushSliceApiClient, stubSlice3)
//         .put(pushSliceCreator.failure({ component: stubSlice }))
//         .put(
//           pushSliceCreator.success({
//             component: stubSlice2,
//             updatedScreenshotsUrls: {},
//           })
//         )
//         .put(
//           pushSliceCreator.success({
//             component: stubSlice3,
//             updatedScreenshotsUrls: {},
//           })
//         )
//         .not.call(pushCustomType, stubCustomType)
//         .run(sagaTimeout)
//         .then(() => {
//           expect(handleError).toHaveBeenCalled();
//         });

//       await new Promise(process.nextTick);

//       expect(trackerSpy).toHaveBeenCalled();
//       const trackerResult = await trackerSpy.mock.calls[0][0].json();
//       expect(trackerResult.name).toEqual(EventNames.ChangesPushed);
//       expect(trackerResult.props.customTypesCreated).toEqual(0);
//       expect(trackerResult.props.slicesCreated).toEqual(0);
//       expect(trackerResult.props.slicesModified).toEqual(2);
//       expect(trackerResult.props.total).toEqual(4);
//       expect(trackerResult.props.errors).toEqual(1);
//     });
//   });
// });

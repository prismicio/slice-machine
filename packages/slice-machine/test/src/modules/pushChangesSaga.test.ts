// @vitest-environment jsdom

import { describe, test, expect, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

import {
  pushCustomTypeCreator,
  pushSliceCreator,
} from "@src/modules/pushChangesSaga/actions";
import { rest } from "msw";
import { ApiError } from "@src/models/ApiError";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { EventNames } from "@src/tracking/types";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import {
  changesPushSaga,
  changesPushCreator,
} from "@src/modules/pushChangesSaga";
import {
  PUSH_CHANGES_TOASTER_ID,
  syncChangesToasterMessage,
} from "@src/modules/pushChangesSaga/syncToaster";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import {
  closeToasterCreator,
  openToasterCreator,
  ToasterType,
  updateToasterCreator,
} from "@src/modules/toaster";
import { modalOpenCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { pushCustomType, pushSliceApiClient } from "@src/apiClient";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import { mockPrismicUserAPI } from "test/__testutils__/mockPrismicUserAPI";
import { mockPrismicAuthAPI } from "test/__testutils__/mockPrismicAuthAPI";
import { createPrismicAuthLoginResponse } from "test/__testutils__/createPrismicAuthLoginResponse";
import { mockCustomTypesAPI } from "test/__testutils__/mockCustomTypesAPI";
import { mockAWSACLAPI } from "test/__testutils__/mockAWSACLAPI";
import { customTypeMock } from "../../__fixtures__/customType";
import sliceModelMock from "../../__fixtures__/sliceModel";

const stubSlice: ComponentUI = {
  model: {
    name: "MySlice",
    id: "my-slice",
    type: SlicesTypes.SharedSlice,
    variations: [],
  },
  from: "slices",
  href: "",
  mockConfig: {},
  pathToSlice: "",
  fileName: "",
  extension: "",
  screenshots: {},
};

const stubSlice2: ComponentUI = {
  ...stubSlice,
  model: {
    ...stubSlice.model,
    name: "AnotherSlice",
    id: "some-slice2",
  },
};

const stubSlice3: ComponentUI = {
  ...stubSlice,
  model: {
    ...stubSlice.model,
    name: "SomeSlice",
    id: "some-slice",
  },
};

const stubCustomType: CustomTypeSM = {
  id: "wooooo",
} as CustomTypeSM;

// Delay before the saga test timesout, usefull as we have a delay in between slice push
const sagaTimeout = 3000;

describe.skip("[pashSaga module]", () => {
  describe("[changesPushSaga]", () => {
    test("pushes slices and custom types", async (ctx) => {
      const adapter = createTestPlugin({
        setup: ({ hook }) => {
          hook("slice:read", () => {
            return { model: sliceModelMock };
          });
          hook("slice:update", () => void 0);
          hook("custom-type:read", () => {
            return { model: customTypeMock };
          });
        },
      });
      const cwd = await createTestProject({ adapter });
      const manager = createSliceMachineManager({
        nativePlugins: { [adapter.meta.name]: adapter },
        cwd,
      });

      await manager.plugins.initPlugins();

      ctx.msw.use(
        createSliceMachineManagerMSWHandler({
          url: "http://localhost:3000/_manager",
          sliceMachineManager: manager,
        })
      );

      const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
        (_req, res, ctx) => res(ctx.json({}))
      );
      ctx.msw.use(rest.post("/api/s", trackingSpy));

      mockPrismicUserAPI(ctx);
      mockPrismicAuthAPI(ctx);

      await manager.user.login(createPrismicAuthLoginResponse());

      const authenticationToken = await manager.user.getAuthenticationToken();
      const sliceMachineConfig = await manager.project.getSliceMachineConfig();

      mockCustomTypesAPI(ctx, {
        async onSliceGet(_req, res, ctx) {
          return res(ctx.status(404));
        },
        async onSliceInsert(_req, res, ctx) {
          return res(ctx.status(201));
        },
        async onCustomTypeGet(_req, res, ctx) {
          return res(ctx.status(404));
        },
        async onCustomTypeInsert(_req, res, ctx) {
          return res(ctx.status(201));
        },
      });
      mockAWSACLAPI(ctx, {
        createEndpoint: {
          expectedPrismicRepository: sliceMachineConfig.repositoryName,
          expectedAuthenticationToken: authenticationToken,
        },
        uploadEndpoint: {
          expectedUploads: [],
        },
      });

      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
        slices: {
          [stubSlice.model.id]: ModelStatus.Modified,
        },
        customTypes: {
          [stubCustomType.id]: ModelStatus.New,
        },
      };
      const onChangesPushed = vi.fn();
      const handleError = vi.fn();

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        modelStatuses,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      const stateTime = Date.now();

      await saga
        .put(
          openToasterCreator({
            message: syncChangesToasterMessage(0, 2),
            type: ToasterType.LOADING,
            options: {
              autoClose: false,
              toastId: PUSH_CHANGES_TOASTER_ID,
            },
          })
        )
        .call(pushSliceApiClient, stubSlice)
        .delay(300)
        .put(
          pushSliceCreator.success({
            component: stubSlice,
            updatedScreenshotsUrls: {},
          })
        )
        .put(
          updateToasterCreator({
            toasterId: PUSH_CHANGES_TOASTER_ID,
            options: {
              render: syncChangesToasterMessage(1, 2),
            },
          })
        )
        .call(pushCustomType, stubCustomType.id)
        .put(pushCustomTypeCreator.success({ customTypeId: stubCustomType.id }))
        .put(
          closeToasterCreator({
            toasterId: PUSH_CHANGES_TOASTER_ID,
          })
        )
        .put(
          openToasterCreator({
            message: "All slices and custom types have been pushed",
            type: ToasterType.SUCCESS,
          })
        )
        .run(sagaTimeout);

      await new Promise(process.nextTick);

      const endTime = Date.now();

      const moreThanTotalTime = endTime - stateTime;

      const trackerResult = await trackingSpy.mock.calls[0][0].json();
      expect(trackerResult.name).toEqual(EventNames.ChangesPushed);
      expect(trackerResult.props.customTypesCreated).toEqual(1);
      expect(trackerResult.props.customTypesModified).toEqual(0);
      expect(trackerResult.props.customTypesDeleted).toEqual(0);
      expect(trackerResult.props.slicesCreated).toEqual(0);
      expect(trackerResult.props.slicesModified).toEqual(1);
      expect(trackerResult.props.slicesDeleted).toEqual(0);
      expect(trackerResult.props.total).toEqual(2);
      expect(trackerResult.props.errors).toEqual(0);
      expect(trackerResult.props.duration).toBeGreaterThan(10);
      expect(trackerResult.props.duration).toBeLessThanOrEqual(
        moreThanTotalTime
      );
      expect(trackerResult.props.missingScreenshots).toEqual(0);
    });

    test("when there's a 403 error while pushing a slice it should stop and open the login model", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
        slices: {
          [stubSlice.model.id]: ModelStatus.Modified,
        },
        customTypes: {
          [stubCustomType.id]: ModelStatus.New,
        },
      };

      const onChangesPushed = vi.fn();
      const handleError = vi.fn();
      const trackerSpy = makeTrackerSpy();
      interceptTracker(trackerSpy);

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.status(403));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        modelStatuses,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      await saga
        .put(
          openToasterCreator({
            message: syncChangesToasterMessage(0, 2),
            type: ToasterType.LOADING,
            options: {
              autoClose: false,
              toastId: PUSH_CHANGES_TOASTER_ID,
            },
          })
        )
        .call(pushSliceApiClient, stubSlice)
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
        .not.call(pushCustomType, stubCustomType)
        .run(sagaTimeout)
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });

      await new Promise(process.nextTick);

      expect(trackerSpy).not.toHaveBeenCalled();
    });

    test("when there's a 403 error while pushing a custom type it should stop", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = vi.fn();
      const handleError = vi.fn();

      const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
        slices: {},
        customTypes: {
          [stubCustomType.id]: ModelStatus.New,
        },
      };

      server.use(
        rest.get("/api/custom-types/push", (_req, res, ctx) => {
          return res(ctx.status(403));
        })
      );

      const trackerSpy = makeTrackerSpy();
      interceptTracker(trackerSpy);

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        modelStatuses,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      await saga
        .put(
          openToasterCreator({
            message: syncChangesToasterMessage(0, 1),
            type: ToasterType.LOADING,
            options: {
              autoClose: false,
              toastId: PUSH_CHANGES_TOASTER_ID,
            },
          })
        )
        .call(pushCustomType, stubCustomType.id)
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
        .run(sagaTimeout)
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });

      await new Promise(process.nextTick);

      expect(trackerSpy).not.toHaveBeenCalled();
    });

    test("when pushing slices, if there an Invalid Model error it should not push custom-types and stop", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
        stubSlice3,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];

      const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
        slices: unSyncedSlices.reduce<Record<string, ModelStatus>>(
          (acc, slice) => {
            acc[slice.model.id] = ModelStatus.New;
            return acc;
          },
          {}
        ),
        customTypes: unSyncedCustomTypes.reduce<Record<string, ModelStatus>>(
          (acc, ct) => {
            acc[ct.id] = ModelStatus.New;
            return acc;
          },
          {}
        ),
      };
      const onChangesPushed = vi.fn();
      const handleError = vi.fn();
      const trackerSpy = makeTrackerSpy();
      interceptTracker(trackerSpy);

      server.use(
        rest.get("http://localhost/api/slices/push", (_req, res, ctx) => {
          const sliceName = _req.url.searchParams.get("sliceName");
          // will fail for Slice one
          if (sliceName === stubSlice.model.name) return res(ctx.status(400));
          return res(ctx.json({}));
        }),
        rest.get("http://localhost/api/custom-types/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        modelStatuses,
        onChangesPushed,
        handleError,
      });

      await expectSaga(changesPushSaga, payload)
        .put(
          openToasterCreator({
            message: syncChangesToasterMessage(0, 4),
            type: ToasterType.LOADING,
            options: {
              autoClose: false,
              toastId: PUSH_CHANGES_TOASTER_ID,
            },
          })
        )
        .call(pushSliceApiClient, stubSlice)
        .call(pushSliceApiClient, stubSlice2)
        .call(pushSliceApiClient, stubSlice3)
        .put(
          closeToasterCreator({
            toasterId: PUSH_CHANGES_TOASTER_ID,
          })
        )
        .put(pushSliceCreator.failure({ component: stubSlice }))
        .put(
          pushSliceCreator.success({
            component: stubSlice2,
            updatedScreenshotsUrls: {},
          })
        )
        .put(
          pushSliceCreator.success({
            component: stubSlice3,
            updatedScreenshotsUrls: {},
          })
        )
        .not.call(pushCustomType, stubCustomType.id)
        .not.put(
          openToasterCreator({
            message: "All slices and custom types have been pushed",
            type: ToasterType.SUCCESS,
          })
        )
        .run(sagaTimeout)
        .then(() => {
          expect(handleError).toHaveBeenCalledWith({
            type: "slice",
            error: ApiError.INVALID_MODEL,
          });
        });

      await new Promise(process.nextTick);

      expect(trackerSpy).toHaveBeenCalled();
      const trackerResult = await trackerSpy.mock.calls[0][0].json();
      expect(trackerResult.name).toEqual(EventNames.ChangesPushed);
      expect(trackerResult.props.errors).toEqual(1);
      expect(trackerResult.props.slicesCreated).toEqual(2);
      expect(trackerResult.props.customTypesCreated).toEqual(0);
      expect(trackerResult.props.total).toEqual(4);
    });

    test("when pushing slices, if there an unexpected error it should not push custom-types", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
        slices: {
          [stubSlice.model.id]: ModelStatus.New,
          [stubSlice2.model.id]: ModelStatus.New,
        },
        customTypes: {
          [stubCustomType.id]: ModelStatus.New,
        },
      };
      const onChangesPushed = vi.fn();
      const handleError = vi.fn();
      const trackerSpy = makeTrackerSpy();
      interceptTracker(trackerSpy);

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.status(500));
        }),
        rest.get("/api/custom-types/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        modelStatuses,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      await saga
        .put(
          openToasterCreator({
            message: syncChangesToasterMessage(0, 3),
            type: ToasterType.LOADING,
            options: {
              autoClose: false,
              toastId: PUSH_CHANGES_TOASTER_ID,
            },
          })
        )
        .call(pushSliceApiClient, stubSlice)
        .call(pushSliceApiClient, stubSlice2)
        .put(
          closeToasterCreator({
            toasterId: PUSH_CHANGES_TOASTER_ID,
          })
        )
        .put(pushSliceCreator.failure({ component: stubSlice })) // We can't expect a success only a failure as it cancels the saga // or can we?
        .not.put(
          pushSliceCreator.success({
            component: stubSlice2,
            updatedScreenshotsUrls: {},
          })
        )
        .not.put(pushSliceCreator.failure({ component: stubSlice2 }))
        .not.call(pushCustomType, stubCustomType.id)
        .not.put(
          openToasterCreator({
            message: "All slices and custom types have been pushed",
            type: ToasterType.SUCCESS,
          })
        )
        .run(sagaTimeout)
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });

      await new Promise(process.nextTick);

      expect(trackerSpy).not.toHaveBeenCalled();
    });

    test("when one slice fails with a 400 status the others should be pushed", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
        stubSlice3,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = vi.fn();
      const handleError = vi.fn();
      const trackerSpy = makeTrackerSpy();
      interceptTracker(trackerSpy);

      const modelStatuses: ModelStatusInformation["modelsStatuses"] = {
        slices: unSyncedSlices.reduce<Record<string, ModelStatus>>(
          (acc, curr) => {
            acc[curr.model.id] = ModelStatus.Modified;
            return acc;
          },
          {}
        ),
        customTypes: unSyncedCustomTypes.reduce<Record<string, ModelStatus>>(
          (acc, curr) => {
            acc[curr.id] = ModelStatus.New;
            return acc;
          },
          {}
        ),
      };

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          const sliceName = _req.url.searchParams.get("sliceName");
          // will fail for Slice one
          if (sliceName === stubSlice.model.name) return res(ctx.status(400));
          return res(ctx.json({}));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        modelStatuses,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      await saga
        .call(pushSliceApiClient, stubSlice)
        .call(pushSliceApiClient, stubSlice2)
        .call(pushSliceApiClient, stubSlice3)
        .put(pushSliceCreator.failure({ component: stubSlice }))
        .put(
          pushSliceCreator.success({
            component: stubSlice2,
            updatedScreenshotsUrls: {},
          })
        )
        .put(
          pushSliceCreator.success({
            component: stubSlice3,
            updatedScreenshotsUrls: {},
          })
        )
        .not.call(pushCustomType, stubCustomType)
        .run(sagaTimeout)
        .then(() => {
          expect(handleError).toHaveBeenCalled();
        });

      await new Promise(process.nextTick);

      expect(trackerSpy).toHaveBeenCalled();
      const trackerResult = await trackerSpy.mock.calls[0][0].json();
      expect(trackerResult.name).toEqual(EventNames.ChangesPushed);
      expect(trackerResult.props.customTypesCreated).toEqual(0);
      expect(trackerResult.props.slicesCreated).toEqual(0);
      expect(trackerResult.props.slicesModified).toEqual(2);
      expect(trackerResult.props.total).toEqual(4);
      expect(trackerResult.props.errors).toEqual(1);
    });
  });
});

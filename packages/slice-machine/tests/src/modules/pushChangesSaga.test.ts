/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { describe, test, beforeAll, afterAll, afterEach } from "@jest/globals";
import {
  changesPushSaga,
  changesPushCreator,
  PUSH_CHANGES_ERRORS,
} from "../../../src/modules/pushChangesSaga";
import {
  PUSH_CHANGES_TOASTER_ID,
  syncChangesToasterMessage,
} from "../../../src/modules/pushChangesSaga/syncToaster";
import { expectSaga } from "redux-saga-test-plan";
import { ComponentUI } from "../../../lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { pushSliceCreator } from "../../../src/modules/selectedSlice/actions";
import { pushCustomTypeCreator } from "../../../src/modules/selectedCustomType";
import {
  closeToasterCreator,
  openToasterCreator,
  ToasterType,
  updateToasterCreator,
} from "../../../src/modules/toaster";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { modalOpenCreator } from "../../../src/modules/modal";
import { ModalKeysEnum } from "../../../src/modules/modal/types";
import { pushCustomType, pushSliceApiClient } from "../../../src/apiClient";
import { ApiError } from "@src/models/ApiError";

const stubSlice: ComponentUI = {
  model: {
    name: "MySlice",
  },
  from: "slices",
} as ComponentUI;

const stubSlice2 = {
  ...stubSlice,
  model: {
    name: "AnotherSlice",
  },
} as ComponentUI;

const stubSlice3 = {
  ...stubSlice,
  model: {
    name: "SomeSlice",
  },
} as ComponentUI;

const stubCustomType: CustomTypeSM = {
  id: "wooooo",
} as CustomTypeSM;

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Delay before the saga test timesout, usefull as we have a delay in between slice push
const sagaTimeout = 3000;

describe("[pashSaga module]", () => {
  describe("[changesPushSaga]", () => {
    test("pushes slices and custom types", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = jest.fn();
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      server.use(
        rest.get("/api/custom-types/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
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
        .put(pushSliceCreator.success({ component: stubSlice }))
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
    });

    test("when there's a 403 error while pushing a slice it should stop and open the login model", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = jest.fn();
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.status(403));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
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
    });

    test("when there's a 403 error while pushing a custom type it should stop", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = jest.fn();
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      server.use(
        rest.get("/api/custom-types/push", (_req, res, ctx) => {
          return res(ctx.status(403));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
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
        .put(pushSliceCreator.success({ component: stubSlice }))
        .call(pushCustomType, stubCustomType.id)
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
        .run(sagaTimeout)
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });
    });

    test("when pushing slices, if there an Invalid Model error it should not push custom-types and stop", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = jest.fn();
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          const sliceName = _req.url.searchParams.get("sliceName");

          // will fail for Slice one
          if (sliceName === stubSlice.model.name) return res(ctx.status(400));
          return res.once(ctx.json({}));
        }),
        rest.get("/api/custom-types/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
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
        .put(pushSliceCreator.failure({ component: stubSlice }))
        .put(pushSliceCreator.success({ component: stubSlice2 }))
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
    });

    test("when pushing slices, if there an unexpected error it should not push custom-types", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = jest.fn();
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          const sliceName = _req.url.searchParams.get("sliceName");

          // will fail for Slice one
          if (sliceName === stubSlice.model.name) return res(ctx.status(500));
          return res(ctx.json({}));
        }),
        rest.get("/api/custom-types/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
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
        .put(pushSliceCreator.failure({ component: stubSlice })) // We can't expect a success only a failure as it cancels the saga
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
    });

    test("when one slice fails with a non 403 the others should be pushed", async () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
        stubSlice3,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const onChangesPushed = jest.fn();
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          const sliceName = _req.url.searchParams.get("sliceName");

          // will fail for Slice 2
          if (sliceName === stubSlice2.model.name) return res(ctx.status(500));
          return res(ctx.json({}));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        onChangesPushed,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .call(pushSliceApiClient, stubSlice2)
        .call(pushSliceApiClient, stubSlice3)
        .not.call(pushCustomType, stubCustomType)
        .run(sagaTimeout)
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });
    });
  });
});

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
import { expectSaga } from "redux-saga-test-plan";
import { ComponentUI } from "../../../lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { pushSliceCreator } from "../../../src/modules/selectedSlice/actions";
import { pushCustomTypeCreator } from "../../../src/modules/selectedCustomType";
import { openToasterCreator, ToasterType } from "../../../src/modules/toaster";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { modalOpenCreator } from "../../../src/modules/modal";
import { ModalKeysEnum } from "../../../src/modules/modal/types";
import { pushCustomType, pushSliceApiClient } from "../../../src/apiClient";

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

describe("[pashSaga module]", () => {
  describe("[changesPushSaga]", () => {
    test("pushes slices and custom types", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
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
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .put(pushSliceCreator.success({ component: stubSlice }))
        .call(pushCustomType, stubCustomType.id)
        .put(pushCustomTypeCreator.success({ customTypeId: stubCustomType.id }))
        .put(
          openToasterCreator({
            message: "All slices and custom types have been pushed",
            type: ToasterType.SUCCESS,
          })
        )
        .run()
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });
    });

    test("when there's an 403 error while pushing a slice it should stop and open the login model", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.status(403));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
        .not.call(pushCustomType, stubCustomType)
        .run()
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });
    });

    test("when there's a 403 error while pushing a custom type it should stop", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
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
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .call(pushCustomType, stubCustomType.id)
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
        .run()
        .then(() => {
          expect(handleError).not.toHaveBeenCalled();
        });
    });

    test("when pushing slices, if there a non 403 error it should not push custom-types", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.status(401));
        })
      );
      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res.once(ctx.json({}));
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
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .put(pushSliceCreator.success({ component: stubSlice }))
        .call(pushSliceApiClient, stubSlice2)
        .put(pushSliceCreator.failure({ component: stubSlice2 }))
        .not.call(pushCustomType, stubCustomType.id)
        .not.put(
          openToasterCreator({
            message: "All slices and custom types have been pushed",
            type: ToasterType.SUCCESS,
          })
        )
        .run()
        .then(() => {
          expect(handleError).toHaveBeenCalledWith(PUSH_CHANGES_ERRORS.SLICES);
        });
    });

    test("when one slice fails with a non 403 the others should be pushed", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice2,
        stubSlice3,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];
      const handleError = jest.fn();

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      server.use(
        rest.get("/api/slices/push", (_req, res, ctx) => {
          return res.once(ctx.status(401));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
        handleError,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .call(pushSliceApiClient, stubSlice2)
        .call(pushSliceApiClient, stubSlice3)
        .not.call(pushCustomType, stubCustomType)
        .run()
        .then(() => {
          expect(handleError).toHaveBeenCalledWith(PUSH_CHANGES_ERRORS.SLICES);
        });
    });
  });
});

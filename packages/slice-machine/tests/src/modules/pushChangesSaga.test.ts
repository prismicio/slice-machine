/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { describe, test, beforeAll, afterAll, afterEach } from "@jest/globals";
import {
  changesPushSaga,
  changesPushCreator,
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
        .run();
    });

    test("when there's an 403 error while pushing a slice it should stop and open the login model", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];

      server.use(
        rest.get("/api/slices/push", (req, res, ctx) => {
          return res(ctx.status(403));
        })
      );

      const payload = changesPushCreator({
        unSyncedSlices,
        unSyncedCustomTypes,
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
        .not.call(pushCustomType, stubCustomType)
        .run();
    });

    test("when there's an error while pushing a custom type it should stop", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];

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
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .call(pushCustomType, stubCustomType.id)
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }))
        .run();
    });

    test("when pushing slices, if there a non 403 error it should not push custom-types", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [stubSlice, stubSlice];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];

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
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .put(pushSliceCreator.failure({ component: stubSlice }))
        .call(pushSliceApiClient, stubSlice)
        .put(pushSliceCreator.success({ component: stubSlice }))
        .not.call(pushCustomType, stubCustomType.id)
        .not.put(
          openToasterCreator({
            message: "All slices and custom types have been pushed",
            type: ToasterType.SUCCESS,
          })
        )
        .run();
    });

    test("when one slice fails with a non 403 the others should be pushed", () => {
      const unSyncedSlices: ReadonlyArray<ComponentUI> = [
        stubSlice,
        stubSlice,
        stubSlice,
      ];
      const unSyncedCustomTypes: ReadonlyArray<CustomTypeSM> = [stubCustomType];

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
      });
      const saga = expectSaga(changesPushSaga, payload);

      return saga
        .call(pushSliceApiClient, stubSlice)
        .call(pushSliceApiClient, stubSlice)
        .call(pushSliceApiClient, stubSlice)
        .not.call(pushCustomType, stubCustomType)
        .run();
    });
  });
});

import { describe, test } from "vitest";
import SegmentClient from "analytics-node";
import "@testing-library/jest-dom";
import { TestApi, testSaga } from "redux-saga-test-plan";
import {
  ChangesPushSagaPayload,
  changesPushCreator,
  changesPushSaga,
} from "../../../src/modules/pushChangesSaga";

import { refreshStateCreator } from "@src/modules/environment";
import { setupServer } from "msw/node";
import { getState, pushChanges } from "../../../src/apiClient";
import { modalOpenCreator } from "../../../src/modules/modal";
import { ModalKeysEnum } from "../../../src/modules/modal/types";
import { openToasterCreator, ToasterType } from "../../../src/modules/toaster";
import { dummyServerState } from "./__fixtures__/serverState";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeSM } from "@lib/models/common/CustomType";

enum LimitType {
  SOFT = "SOFT",
  HARD = "HARD",
}

class CustomAxiosError extends Error {
  isAxiosError: boolean;
  response?: {
    data: any;
    status: number;
    statusText?: string;
    headers?: any;
    config?: any;
  };

  constructor(status: number) {
    super();
    this.isAxiosError = true;
    this.response = { data: {}, status };
  }
}

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const changesPayload: ChangesPushSagaPayload = {
  confirmDeleteDocuments: false,
  changedSlices: [
    {
      slice: {
        model: { id: "slice1", variations: [{ id: "var1" }] },
        screenshots: { var1: { hash: "__HASH__" } },
        from: "library1",
      } as unknown as ComponentUI,
      status: ModelStatus.New,
    },
  ],
  changedCustomTypes: [
    {
      customType: { id: "customType1" } as CustomTypeSM,
      status: ModelStatus.Modified,
    },
  ],
};

const pushChangesApiPayload = {
  confirmDeleteDocuments: false,
  changes: [
    {
      id: "slice1",
      status: ModelStatus.New,
      libraryID: "library1",
      type: "Slice",
    },
    {
      id: "customType1",
      status: ModelStatus.Modified,
      type: "CustomType",
    },
  ],
};

describe("[pushChanges module]", () => {
  describe("[changesPushSaga]", () => {
    let saga: TestApi;

    beforeEach(() => {
      saga = testSaga(
        changesPushSaga,
        changesPushCreator.request(changesPayload)
      );
    });
    test("Pushes changes when API response is OK display success toaster", async () => {
      saga.next().call(pushChanges, pushChangesApiPayload);

      saga.next(null).call(getState);

      saga.next(dummyServerState).put(
        refreshStateCreator({
          env: dummyServerState.env,
          remoteCustomTypes: dummyServerState.remoteCustomTypes,
          localCustomTypes: dummyServerState.customTypes,
          libraries: dummyServerState.libraries,
          remoteSlices: [],
          clientError: undefined,
        })
      );

      saga.next().put(changesPushCreator.success());

      saga.next().put(
        openToasterCreator({
          content: "All slices and types have been pushed",
          type: ToasterType.SUCCESS,
        })
      );

      saga.next().isDone();

      // Wait for network request to be performed
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    });

    test.each([
      [LimitType.HARD, ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER],
      [LimitType.SOFT, ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER],
    ])(
      "Displays delete limit modal when there is a %s limit response",
      async (limitType, expectedModalKey) => {
        saga.next().call(pushChanges, pushChangesApiPayload);

        // This test will also verify that the details are sorted in descending order.
        saga
          .next({
            type: limitType,
            details: {
              customTypes: [
                {
                  id: "CT1",
                  numberOfDocuments: 2000,
                  url: "url",
                },
                {
                  id: "CT2",
                  numberOfDocuments: 3000,
                  url: "url",
                },
              ],
            },
          })
          .put(
            changesPushCreator.failure({
              type: limitType,
              details: {
                customTypes: [
                  {
                    id: "CT2",
                    numberOfDocuments: 3000,
                    url: "url",
                  },
                  {
                    id: "CT1",
                    numberOfDocuments: 2000,
                    url: "url",
                  },
                ],
              },
            })
          );

        saga.next().put(
          modalOpenCreator({
            modalKey: expectedModalKey,
          })
        );

        saga.next().isDone();

        // Wait for network request to be performed
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
      }
    );

    test("Displays an error toaster when there is an API error on push", () => {
      saga.next().call(pushChanges, pushChangesApiPayload);

      saga.throw(new Error()).put(
        openToasterCreator({
          content:
            "Something went wrong when pushing your changes. Check your terminal logs.",
          type: ToasterType.ERROR,
        })
      );

      saga.next().isDone();
    });

    // TODO: unskip when auth error is handled
    test.skip.each([[401], [403]])(
      "when there's a %s error while pushing a slice it should stop and open the login model",
      (errorCode) => {
        saga.next().call(pushChanges, pushChangesApiPayload);

        const customError = new CustomAxiosError(errorCode);

        saga
          .throw(customError)
          .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));

        saga.next().isDone();
      }
    );

    // TODO: unskip when invalid references are handled
    test.skip("when there's INVALID_CUSTOM_TYPES response, open the references drawer", () => {
      saga.next().call(pushChanges, {
        confirmDeleteDocuments: false,
        changes: [
          { id: "slice1", status: ModelStatus.New, type: "Slice" },
          {
            id: "customType1",
            status: ModelStatus.Modified,
            type: "CustomType",
          },
        ],
      });

      saga
        .next({
          status: 200,
          data: {
            type: "INVALID_CUSTOM_TYPES",
            details: {
              customTypes: [{ id: "CT1" }, { id: "CT2" }],
            },
          },
        })
        .put(
          changesPushCreator.failure({
            type: "INVALID_CUSTOM_TYPES",
            details: {
              customTypes: [{ id: "CT1" }, { id: "CT2" }],
            },
          })
        );

      saga.next().put(
        modalOpenCreator({
          modalKey: ModalKeysEnum.REFERENCES_MISSING_DRAWER,
        })
      );

      saga.next().isDone();
    });
  });
});

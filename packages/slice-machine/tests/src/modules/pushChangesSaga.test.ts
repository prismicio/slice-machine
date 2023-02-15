import { afterAll, afterEach, beforeAll, describe, test } from "@jest/globals";
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
import { dummyServerState } from "./__mocks__/serverState";
import { LimitType } from "@slicemachine/client/build/models/BulkChanges";
import {
  rest,
  type RestContext,
  type RestRequest,
  type ResponseComposition,
} from "msw";

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

const makeTrackerSpy = () =>
  jest.fn((_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(ctx.json({}));
  });

const interceptTracker = (spy: ReturnType<typeof makeTrackerSpy>) =>
  server.use(rest.post("http://localhost/api/s", spy));

const changesPayload: ChangesPushSagaPayload = {
  confirmDeleteDocuments: false,
  unSyncedSlices: [], // used only for tracking, which we mock
  unSyncedCustomTypes: [], // used only for tracking, which we mock
  modelsStatuses: { slices: {}, customTypes: {} }, // used only for tracking, which we mock
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
    it("Pushes changes when API response is OK display success toaster", () => {
      const fakeTracker = makeTrackerSpy();
      interceptTracker(fakeTracker); // warnings happen without this

      saga.next().call(pushChanges, {
        confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
      });

      saga
        .next({
          status: 200,
          data: null,
        })
        .call(getState);

      saga
        .next({
          status: 200,
          data: dummyServerState,
        })
        .put(
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
          content: "All slices and custom types have been pushed",
          type: ToasterType.SUCCESS,
        })
      );

      saga.next().isDone();
    });

    test.each([
      [LimitType.HARD, ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER],
      [LimitType.SOFT, ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER],
    ])(
      "Displays delete limit modal when there is a %s limit response",
      (limitType, expectedModalKey) => {
        const fakeTracker = makeTrackerSpy();
        interceptTracker(fakeTracker); // warnings happen without this

        saga.next().call(pushChanges, {
          confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
        });

        // This test will also verify that the details are sorted in descending order.
        saga
          .next({
            status: 200,
            data: {
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
      }
    );

    it("Displays an error toaster when there is an API error on push", () => {
      saga.next().call(pushChanges, {
        confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
      });

      saga.throw(new Error()).put(
        openToasterCreator({
          content:
            "Something went wrong when pushing your changes. Check your terminal logs.",
          type: ToasterType.ERROR,
        })
      );

      saga.next().isDone();
    });

    test.each([[401], [403]])(
      "when there's a %s error while pushing a slice it should stop and open the login model",
      (errorCode) => {
        saga.next().call(pushChanges, {
          confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
        });

        const customError = new CustomAxiosError(errorCode);

        saga
          .throw(customError)
          .put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));

        saga.next().isDone();
      }
    );

    it("when there's INVALID_CUSTOM_TYPES response, open the references drawer", () => {
      saga.next().call(pushChanges, {
        confirmDeleteDocuments: changesPayload.confirmDeleteDocuments,
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

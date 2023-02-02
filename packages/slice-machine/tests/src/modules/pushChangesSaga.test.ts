import { afterAll, afterEach, beforeAll, describe, test } from "@jest/globals";
import "@testing-library/jest-dom";
import { TestApi, testSaga } from "redux-saga-test-plan";
import {
  changesPushCreator,
  changesPushSaga,
} from "../../../src/modules/pushChangesSaga";

import { refreshStateCreator } from "@src/modules/environment";
import { syncChangeCreator } from "@src/modules/pushChangesSaga/actions";
import { setupServer } from "msw/node";
import { getState, pushChanges } from "../../../src/apiClient";
import { modalOpenCreator } from "../../../src/modules/modal";
import { ModalKeysEnum } from "../../../src/modules/modal/types";
import { openToasterCreator, ToasterType } from "../../../src/modules/toaster";
import { dummyServerState } from "./__mocks__/serverState";
import { LimitType } from "@slicemachine/client/build/models/BulkChanges";

describe("[pushChanges module]", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("[changesPushSaga]", () => {
    const requestPayload = {
      confirmDeleteDocuments: false,
    };

    let saga: TestApi;

    beforeEach(() => {
      saga = testSaga(
        changesPushSaga,
        changesPushCreator.request(requestPayload)
      );
    });
    it("Pushes changes when API response is OK display success toaster", () => {
      saga.next().call(pushChanges, requestPayload);

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

      saga.next().put(syncChangeCreator());

      saga.next().put(
        openToasterCreator({
          content: "All slices and custom types have been pushed",
          type: ToasterType.SUCCESS,
        })
      );

      saga.next().isDone();
    });

    test.each([
      [LimitType.HARD, ModalKeysEnum.DELETE_DOCUMENTS_DRAWER_OVER_LIMIT],
      [LimitType.SOFT, ModalKeysEnum.DELETE_DOCUMENTS_DRAWER],
    ])(
      "Displays delete limit modal when there is a %s limit response",
      (limitType, expectedModalKey) => {
        saga.next().call(pushChanges, requestPayload);

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
      saga.next().call(pushChanges, requestPayload);

      saga.throw(new Error()).put(
        openToasterCreator({
          content: "Something went wrong when pushing your changes.",
          type: ToasterType.ERROR,
        })
      );

      saga.next().isDone();
    });

    // DO we need to handle this??
    // test.only("when there's a 403 error while pushing a slice it should stop and open the login model", async () => {
  });
});

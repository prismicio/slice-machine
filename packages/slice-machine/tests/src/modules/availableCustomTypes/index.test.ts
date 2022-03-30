import {
  createCustomTypeSaga,
  createCustomTypeCreator,
  availableCustomTypesReducer,
} from "@src/modules/availableCustomTypes";
import { testSaga } from "redux-saga-test-plan";
import { AvailableCustomTypesStoreType } from "@src/modules/availableCustomTypes/types";
import { refreshStateCreator } from "@src/modules/environment";
import "@testing-library/jest-dom";

import { dummyServerState } from "../__mocks__/serverState";
import { saveCustomType } from "@src/apiClient";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { push } from "connected-next-router";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

const dummyCustomTypesState: AvailableCustomTypesStoreType = {};

describe("[Available Custom types module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(availableCustomTypesReducer(dummyCustomTypesState, {})).toEqual(
        dummyCustomTypesState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        availableCustomTypesReducer(dummyCustomTypesState, { type: "NO.MATCH" })
      ).toEqual(dummyCustomTypesState);
    });

    it("should update the custom types state given STATE/GET.RESPONSE action", () => {
      const action = refreshStateCreator({
        env: dummyServerState.env,
        remoteCustomTypes: dummyServerState.remoteCustomTypes,
        localCustomTypes: dummyServerState.customTypes,
        libraries: dummyServerState.libraries,
      });

      expect(
        availableCustomTypesReducer(dummyCustomTypesState, action)
      ).toEqual({
        ...dummyCustomTypesState,
        about: {
          local: dummyServerState.customTypes[0],
        },
      });
    });
    it("should update the custom types state given CUSTOM_TYPES/CREATE.SUCCESS action", () => {
      const createdCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };

      const action = createCustomTypeCreator.success({
        newCustomType: createdCustomType,
      });

      expect(
        availableCustomTypesReducer(dummyCustomTypesState, action)
      ).toEqual({
        ...dummyCustomTypesState,
        [createdCustomType.id]: {
          local: createdCustomType,
        },
      });
    });
  });

  describe("[createCustomTypeSaga]", () => {
    it("should call the api and dispatch the good actions on success", () => {
      const actionPayload = { id: "id", label: "label", repeatable: true };
      const customTypeCreated = createCustomType(
        actionPayload.id,
        actionPayload.label,
        actionPayload.repeatable
      );
      const saga = testSaga(
        createCustomTypeSaga,
        createCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(saveCustomType, customTypeCreated, {});
      saga
        .next()
        .put(
          createCustomTypeCreator.success({ newCustomType: customTypeCreated })
        );
      saga
        .next()
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE }));
      saga.next().put(push("/cts/id"));
      saga.next().put(
        openToasterCreator({
          message: "Custom type saved",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();
    });
    it("should call the api and dispatch the good actions on failure", () => {
      const actionPayload = { id: "id", label: "label", repeatable: true };
      const customTypeCreated = createCustomType(
        actionPayload.id,
        actionPayload.label,
        actionPayload.repeatable
      );
      const saga = testSaga(
        createCustomTypeSaga,
        createCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(saveCustomType, customTypeCreated, {});
      saga.throw(new Error()).put(
        openToasterCreator({
          message: "Internal Error: Custom type not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});

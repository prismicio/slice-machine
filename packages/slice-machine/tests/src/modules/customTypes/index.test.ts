import {
  createCustomTypeSaga,
  createCustomTypeCreator,
  customTypesReducer,
} from "@src/modules/customTypes";
import { testSaga } from "redux-saga-test-plan";
import { CustomTypesStoreType } from "@src/modules/customTypes/types";
import { refreshStateCreator } from "@src/modules/environment";
import "@testing-library/jest-dom";

import { dummyServerState } from "../__mocks__/serverState";
import { saveCustomType } from "@src/apiClient";
import { createCustomType } from "@src/modules/customTypes/factory";
import { push } from "connected-next-router";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";

const dummyCustomTypesState: CustomTypesStoreType = {
  localCustomTypes: [],
  remoteCustomTypes: [],
};

describe("[Custom types module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(customTypesReducer(dummyCustomTypesState, {})).toEqual(
        dummyCustomTypesState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        customTypesReducer(dummyCustomTypesState, { type: "NO.MATCH" })
      ).toEqual(dummyCustomTypesState);
    });

    it("should update the custom types state given STATE/GET.RESPONSE action", () => {
      const action = refreshStateCreator({
        env: dummyServerState.env,
        configErrors: dummyServerState.configErrors,
        warnings: dummyServerState.warnings,
        remoteCustomTypes: dummyServerState.remoteCustomTypes,
        localCustomTypes: dummyServerState.customTypes,
        libraries: dummyServerState.libraries,
      });

      expect(customTypesReducer(dummyCustomTypesState, action)).toEqual({
        ...dummyCustomTypesState,
        localCustomTypes: dummyServerState.customTypes,
      });
    });
    it("should update the custom types state given CUSTOM_TYPES/CREATE.SUCCESS action", () => {
      const createdCustomType: CustomType<ObjectTabs> = {
        id: "id",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: {
          Main: {
            key: "Main",
            value: {},
          },
        },
      };

      const action = createCustomTypeCreator.success({
        newCustomType: createdCustomType,
      });

      expect(customTypesReducer(dummyCustomTypesState, action)).toEqual({
        ...dummyCustomTypesState,
        localCustomTypes: [
          createdCustomType,
          ...dummyCustomTypesState.localCustomTypes,
        ],
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

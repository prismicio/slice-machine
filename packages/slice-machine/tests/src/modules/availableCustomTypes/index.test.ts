import {
  createCustomTypeSaga,
  createCustomTypeCreator,
  availableCustomTypesReducer,
  renameCustomTypeCreator,
  renameCustomTypeSaga,
  deleteCustomTypeSaga,
  deleteCustomTypeCreator,
} from "@src/modules/availableCustomTypes";
import { pushCustomTypeCreator } from "@src/modules/pushChangesSaga/actions";
import { testSaga } from "redux-saga-test-plan";
import { AvailableCustomTypesStoreType } from "@src/modules/availableCustomTypes/types";
import { refreshStateCreator } from "@src/modules/environment";
import "@testing-library/jest-dom";

import { dummyServerState } from "../__mocks__/serverState";
import {
  deleteCustomType,
  renameCustomType,
  saveCustomType,
} from "@src/apiClient";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { push } from "connected-next-router";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import axios, { AxiosError } from "axios";

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
        remoteSlices: dummyServerState.remoteCustomTypes,
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

    it("should update the custom types state given CUSTOM_TYPES/PUSH.SUCCESS action", () => {
      const newCustomType: CustomTypeSM = {
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

      const existingCustomType: CustomTypeSM = {
        id: "id2",
        label: "updatedLabel",
        repeatable: false,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };

      const state: AvailableCustomTypesStoreType = {
        ...dummyCustomTypesState,
        [newCustomType.id]: {
          local: newCustomType, // simulating a new custom type created locally
        },
        [existingCustomType.id]: {
          local: existingCustomType, // simulating modified custom type locally
          remote: newCustomType,
        },
      };

      const pushNewCustomType = pushCustomTypeCreator.success({
        customTypeId: newCustomType.id,
      });

      const pushExistingCustomType = pushCustomTypeCreator.success({
        customTypeId: existingCustomType.id,
      });

      expect(availableCustomTypesReducer(state, pushNewCustomType)).toEqual({
        ...state,
        [newCustomType.id]: {
          local: newCustomType,
          remote: newCustomType,
        },
      });

      expect(
        availableCustomTypesReducer(state, pushExistingCustomType)
      ).toEqual({
        ...state,
        [existingCustomType.id]: {
          local: existingCustomType,
          remote: existingCustomType,
        },
      });
    });

    it("should update the custom types state given CUSTOM_TYPES/DELETE.SUCCESS action", () => {
      const customTypeIdToDelete = "id";
      const mockCustomTypeToDelete: CustomTypeSM = {
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

      const originalState = { ...dummyCustomTypesState };

      originalState[customTypeIdToDelete] = {
        local: mockCustomTypeToDelete,
      };
      mockCustomTypeToDelete.id = "another_ct";
      originalState["another_ct"] = { local: mockCustomTypeToDelete };

      const action = deleteCustomTypeCreator.success({
        customTypeId: customTypeIdToDelete,
      });

      const result = availableCustomTypesReducer(originalState, action);

      const expectState = { ...originalState };
      delete expectState[customTypeIdToDelete];

      expect(result).toEqual(expectState);
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

  it("should update the custom types state given CUSTOM_TYPES/RENAME.RESPONSE action", () => {
    const customType1: CustomTypeSM = {
      id: "id_1",
      label: "label_1",
      repeatable: false,
      status: true,
      tabs: [],
    };
    const customType2: CustomTypeSM = {
      id: "id_2",
      label: "label_2",
      repeatable: false,
      status: true,
      tabs: [],
    };
    const updatedCustomType2: CustomTypeSM = {
      id: "id_2",
      label: "label NEW",
      repeatable: false,
      status: true,
      tabs: [],
    };

    const existingCustomTypes: AvailableCustomTypesStoreType = {
      id_1: { local: customType1 },
      id_2: { local: customType2, remote: customType2 },
    };

    const action = renameCustomTypeCreator.success({
      customTypeId: "id_2",
      newCustomTypeName: "label NEW",
    });

    expect(availableCustomTypesReducer(existingCustomTypes, action)).toEqual({
      id_1: { local: customType1 },
      id_2: { local: updatedCustomType2, remote: customType2 },
    });
  });

  describe("[renameCustomTypeSaga]", () => {
    it("should call the api and dispatch the good actions on success", () => {
      const actionPayload = {
        customTypeId: "id",
        newCustomTypeName: "newName",
      };
      const saga = testSaga(
        renameCustomTypeSaga,
        renameCustomTypeCreator.request(actionPayload)
      );

      saga
        .next()
        .call(
          renameCustomType,
          actionPayload.customTypeId,
          actionPayload.newCustomTypeName
        );
      saga.next().put(renameCustomTypeCreator.success(actionPayload));
      saga
        .next()
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.RENAME_CUSTOM_TYPE }));
      saga.next().put(
        openToasterCreator({
          message: "Custom type updated",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();
    });
    it("should call the api and dispatch the good actions on failure", () => {
      const actionPayload = {
        customTypeId: "id",
        newCustomTypeName: "newName",
      };
      const saga = testSaga(
        renameCustomTypeSaga,
        renameCustomTypeCreator.request(actionPayload)
      );

      saga
        .next()
        .call(
          renameCustomType,
          actionPayload.customTypeId,
          actionPayload.newCustomTypeName
        );
      saga.throw(new Error()).put(
        openToasterCreator({
          message: "Internal Error: Custom type not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });

  describe("[deleteCustomTypeSaga]", () => {
    it("should call the api and dispatch the good actions on success", () => {
      const actionPayload = {
        customTypeId: "id",
        customTypeName: "name",
      };
      const saga = testSaga(
        deleteCustomTypeSaga,
        deleteCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(deleteCustomType, actionPayload.customTypeId);
      saga.next().put(deleteCustomTypeCreator.success(actionPayload));
      saga.next().put(
        openToasterCreator({
          message: `Successfully deleted Custom Type “${actionPayload.customTypeName}”`,
          type: ToasterType.SUCCESS,
        })
      );

      saga
        .next()
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.DELETE_CUSTOM_TYPE }));
      saga.next().isDone();
    });
    it("should call the api and dispatch the good actions on unknown failure", () => {
      const actionPayload = {
        customTypeId: "id",
        customTypeName: "name",
      };
      const saga = testSaga(
        deleteCustomTypeSaga,
        deleteCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(deleteCustomType, actionPayload.customTypeId);
      saga.throw(new Error()).put(
        openToasterCreator({
          message:
            "An unexpected error happened while deleting your custom type.",
          type: ToasterType.ERROR,
        })
      );

      saga
        .next()
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.DELETE_CUSTOM_TYPE }));
      saga.next().isDone();
    });
    it("should call the api and dispatch the good actions on an API error", () => {
      const actionPayload = {
        customTypeId: "id",
        customTypeName: "name",
      };
      const saga = testSaga(
        deleteCustomTypeSaga,
        deleteCustomTypeCreator.request(actionPayload)
      );

      jest.spyOn(axios, "isAxiosError").mockImplementation(() => true);

      const err = Error() as AxiosError;
      // @ts-expect-error Ignoring the type error since we only need these properties to test
      err.response = {
        data: { reason: "Could not delete custom type", type: "error" },
      };

      saga.next().call(deleteCustomType, actionPayload.customTypeId);
      saga.throw(err).put(
        openToasterCreator({
          message: "Could not delete custom type",
          type: ToasterType.ERROR,
        })
      );

      saga
        .next()
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.DELETE_CUSTOM_TYPE }));
      saga.next().isDone();
    });
    it("should call the api and dispatch the good actions on an API warning", () => {
      const actionPayload = {
        customTypeId: "id",
        customTypeName: "name",
      };
      const saga = testSaga(
        deleteCustomTypeSaga,
        deleteCustomTypeCreator.request(actionPayload)
      );

      jest.spyOn(axios, "isAxiosError").mockImplementation(() => true);

      const err = Error() as AxiosError;
      // @ts-expect-error Ignoring the type error since we only need these properties to test
      err.response = {
        data: { reason: "Could not delete custom type", type: "warning" },
      };

      saga.next().call(deleteCustomType, actionPayload.customTypeId);
      saga.throw(err).put(deleteCustomTypeCreator.success(actionPayload));
      saga.next().put(
        openToasterCreator({
          message: "Could not delete custom type",
          type: ToasterType.WARNING,
        })
      );

      saga
        .next()
        .put(modalCloseCreator({ modalKey: ModalKeysEnum.DELETE_CUSTOM_TYPE }));
      saga.next().isDone();
    });
  });
});

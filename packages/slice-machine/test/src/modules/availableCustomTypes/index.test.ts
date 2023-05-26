import { describe, expect, it } from "vitest";
import {
  createCustomTypeSaga,
  createCustomTypeCreator,
  availableCustomTypesReducer,
  renameCustomTypeCreator,
  renameCustomTypeSaga,
  selectCustomTypeById,
  deleteCustomTypeSaga,
  deleteCustomTypeCreator,
} from "@src/modules/availableCustomTypes";
import { testSaga } from "redux-saga-test-plan";
import { AvailableCustomTypesStoreType } from "@src/modules/availableCustomTypes/types";
import { refreshStateCreator } from "@src/modules/environment";

import { dummyServerState } from "../__fixtures__/serverState";
import {
  deleteCustomType,
  renameCustomType,
  saveCustomType,
} from "@src/apiClient";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { push } from "connected-next-router";
import { modalCloseCreator } from "@src/modules/modal";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { deleteSliceCreator } from "@src/modules/slices";
import { CustomTypeFormat } from "@slicemachine/manager";

const dummyCustomTypesState: AvailableCustomTypesStoreType = {};

describe("[Available Custom types module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(availableCustomTypesReducer(dummyCustomTypesState, {})).toEqual(
        dummyCustomTypesState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"CUST... Remove this comment to see the full error message
        availableCustomTypesReducer(dummyCustomTypesState, { type: "NO.MATCH" })
      ).toEqual(dummyCustomTypesState);
    });

    it("should update the custom types state given STATE/GET.RESPONSE action", () => {
      const action = refreshStateCreator({
        env: dummyServerState.env,
        remoteCustomTypes: dummyServerState.remoteCustomTypes,
        localCustomTypes: dummyServerState.customTypes,
        libraries: dummyServerState.libraries,
        // @ts-expect-error TS(2322) FIXME: Type 'readonly ({ id: string; label: string | null... Remove this comment to see the full error message
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

    it("should update the custom types state given SLICES/DELETE.SUCCESS action", () => {
      const sliceToDeleteId = "slice_id";
      const mockCustomTypeToUpdate: CustomTypeSM = {
        id: "id",
        label: "lama",
        repeatable: false,
        status: true,
        tabs: [
          {
            key: "Main",
            value: [],
            sliceZone: {
              key: "slices",
              value: [
                {
                  key: sliceToDeleteId,
                  value: {
                    type: "SharedSlice",
                  },
                },
                {
                  key: "slice_2",
                  value: {
                    type: "SharedSlice",
                  },
                },
              ],
            },
          },
        ],
      };

      const originalState = { ...dummyCustomTypesState };

      originalState["id"] = {
        local: mockCustomTypeToUpdate,
        remote: mockCustomTypeToUpdate,
      };
      const action = deleteSliceCreator.success({
        sliceId: sliceToDeleteId,
        sliceName: "slice_name",
        libName: "lib",
      });

      const result = availableCustomTypesReducer(
        originalState,
        action
      ) as AvailableCustomTypesStoreType;

      expect(
        Object.values(result).flatMap((localAndRemote) => {
          return Object.values(localAndRemote);
        })
      ).not.toContain(undefined);

      expect(result).toEqual({
        id: {
          local: {
            id: "id",
            label: "lama",
            repeatable: false,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
                sliceZone: {
                  key: "slices",
                  value: [
                    {
                      key: "slice_2",
                      value: {
                        type: "SharedSlice",
                      },
                    },
                  ],
                },
              },
            ],
          },
          remote: mockCustomTypeToUpdate,
        },
      });
    });
  });

  describe("[createCustomTypeSaga]", () => {
    it("should call the api and dispatch the good actions on success", () => {
      const actionPayload = {
        format: "custom" as const, // CustomTypeFormat,
        id: "id",
        label: "label",
        repeatable: true,
      };
      const customTypeCreated = createCustomType(
        actionPayload.id,
        actionPayload.label,
        actionPayload.repeatable,
        actionPayload.format
      );
      const saga = testSaga(
        createCustomTypeSaga,
        createCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(saveCustomType, customTypeCreated);
      saga
        .next()
        .put(
          createCustomTypeCreator.success({ newCustomType: customTypeCreated })
        );
      saga.next().put(modalCloseCreator());
      saga.next().put(push("/custom-types/id"));
      saga.next().put(
        openToasterCreator({
          content: "Custom Type saved",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();
    });

    it("should call the api and dispatch the good actions on failure", () => {
      const actionPayload = {
        id: "id",
        label: "label",
        repeatable: true,
        format: "custom",
      };
      const customTypeCreated = createCustomType(
        actionPayload.id,
        actionPayload.label,
        actionPayload.repeatable,
        actionPayload.format
      );
      const saga = testSaga(
        createCustomTypeSaga,
        createCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(saveCustomType, customTypeCreated);
      saga.throw(new Error()).put(
        openToasterCreator({
          content: "Internal Error: Custom Type not saved",
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
      renamedCustomType: updatedCustomType2,
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
        format: "custom",
      };
      const saga = testSaga(
        renameCustomTypeSaga,
        renameCustomTypeCreator.request(actionPayload)
      );

      const originalCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        repeatable: false,
        status: true,
        format: "custom",
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };

      const renamedCustomType: CustomTypeSM = {
        ...originalCustomType,
        label: actionPayload.newCustomTypeName,
      };

      saga.next().select(selectCustomTypeById, originalCustomType.id);
      saga
        .next({ local: originalCustomType })
        .call(renameCustomType, renamedCustomType);
      saga.next().put(renameCustomTypeCreator.success({ renamedCustomType }));
      saga.next().put(modalCloseCreator());
      saga.next().put(
        openToasterCreator({
          content: "Custom Type updated",
          type: ToasterType.SUCCESS,
        })
      );
      saga.next().isDone();
    });
    it("should call the api and dispatch the good actions on failure", () => {
      const actionPayload = {
        customTypeId: "id",
        newCustomTypeName: "newName",
        format: "custom",
      };
      const saga = testSaga(
        renameCustomTypeSaga,
        renameCustomTypeCreator.request(actionPayload)
      );

      const originalCustomType: CustomTypeSM = {
        id: "id",
        label: "lama",
        repeatable: false,
        status: true,
        format: "custom",
        tabs: [
          {
            key: "Main",
            value: [],
          },
        ],
      };

      const renamedCustomType: CustomTypeSM = {
        ...originalCustomType,
        label: actionPayload.newCustomTypeName,
      };

      saga.next().select(selectCustomTypeById, originalCustomType.id);
      saga
        .next({ local: originalCustomType })
        .call(renameCustomType, renamedCustomType);
      saga.throw(new Error()).put(
        openToasterCreator({
          content: "Internal Error: Custom Type not saved",
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
        format: "custom",
      };
      const saga = testSaga(
        deleteCustomTypeSaga,
        deleteCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(deleteCustomType, actionPayload.customTypeId);
      saga
        .next({ errors: [] })
        .put(deleteCustomTypeCreator.success(actionPayload));
      saga.next().put(
        openToasterCreator({
          content: `Successfully deleted Custom Type “${actionPayload.customTypeName}”`,
          type: ToasterType.SUCCESS,
        })
      );

      saga.next().put(modalCloseCreator());
      saga.next().isDone();
    });
    it("should call the api and dispatch the good actions on unknown failure", () => {
      const actionPayload = {
        customTypeId: "id",
        customTypeName: "name",
        format: "custom",
      };
      const saga = testSaga(
        deleteCustomTypeSaga,
        deleteCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(deleteCustomType, actionPayload.customTypeId);
      saga.throw(new Error()).put(
        openToasterCreator({
          content:
            "An unexpected error happened while deleting your Custom Type.",
          type: ToasterType.ERROR,
        })
      );

      saga.next().put(modalCloseCreator());
      saga.next().isDone();
    });
  });
});

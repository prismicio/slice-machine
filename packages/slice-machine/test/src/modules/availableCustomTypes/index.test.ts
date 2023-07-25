import { describe, expect, it } from "vitest";
import {
  createCustomTypeSaga,
  createCustomTypeCreator,
  availableCustomTypesReducer,
  deleteCustomTypeCreator,
} from "@src/modules/availableCustomTypes";
import { testSaga } from "redux-saga-test-plan";
import { AvailableCustomTypesStoreType } from "@src/modules/availableCustomTypes/types";
import { refreshStateCreator } from "@src/modules/environment";

import { dummyServerState } from "../__fixtures__/serverState";
import { saveCustomType } from "@src/apiClient";
import { createCustomType } from "@src/features/customTypes/customTypesTable/createCustomType";
import { push } from "connected-next-router";
import { modalCloseCreator } from "@src/modules/modal";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { CustomTypeSM, CustomTypes } from "@lib/models/common/CustomType";
import { deleteSliceCreator } from "@src/modules/slices";

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
        format: "custom",
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
        format: "custom",
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
        format: "custom",
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
            format: "custom",
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
      const customTypeCreated = CustomTypes.toSM(
        createCustomType(
          actionPayload.id,
          actionPayload.label,
          actionPayload.repeatable,
          actionPayload.format
        )
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
      saga
        .next()
        .inspect(
          (action: {
            payload: { action: { type: string; payload: { type: string } } };
          }) => {
            expect(action.payload.action.type).toBe("TOASTER/OPEN");
            expect(action.payload.action.payload.type).toBe(
              ToasterType.SUCCESS
            );
          }
        );
      saga.next().isDone();
    });

    it("should call the api and dispatch the good actions on failure", () => {
      const actionPayload = {
        id: "id",
        label: "label",
        repeatable: true,
        format: "custom" as const,
      };
      const customTypeCreated = CustomTypes.toSM(
        createCustomType(
          actionPayload.id,
          actionPayload.label,
          actionPayload.repeatable,
          actionPayload.format
        )
      );
      const saga = testSaga(
        createCustomTypeSaga,
        createCustomTypeCreator.request(actionPayload)
      );

      saga.next().call(saveCustomType, customTypeCreated);
      saga.throw(new Error()).put(
        openToasterCreator({
          content: "Internal Error: Custom type not saved",
          type: ToasterType.ERROR,
        })
      );
      saga.next().isDone();
    });
  });
});

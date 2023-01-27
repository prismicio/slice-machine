import { Reducer } from "redux";
import { AvailableCustomTypesStoreType } from "./types";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { refreshStateCreator } from "@src/modules/environment";
import { call, fork, put, takeLatest } from "redux-saga/effects";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  deleteCustomType,
  renameCustomType,
  saveCustomType,
} from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { push } from "connected-next-router";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import {
  normalizeFrontendCustomType,
  normalizeFrontendCustomTypes,
} from "@lib/models/common/normalizers/customType";
import { saveCustomTypeCreator } from "../selectedCustomType/actions";
import { pushCustomTypeCreator } from "../pushChangesSaga/actions";
import axios from "axios";
import { DeleteCustomTypeResponse } from "@lib/models/common/CustomType";
import { omit } from "lodash";
import { deleteSliceCreator } from "../slices";
import { filterSliceFromCustomType } from "@lib/utils/shared/customTypes";
import {
  LocalAndRemoteCustomType,
  LocalOrRemoteCustomType,
  RemoteOnlyCustomType,
  hasLocal,
  hasLocalAndRemote,
  hasRemote,
} from "@lib/models/common/ModelData";

// Action Creators
export const createCustomTypeCreator = createAsyncAction(
  "CUSTOM_TYPES/CREATE.REQUEST",
  "CUSTOM_TYPES/CREATE.RESPONSE",
  "CUSTOM_TYPES/CREATE.FAILURE"
)<
  {
    id: string;
    label: string;
    repeatable: boolean;
  },
  {
    newCustomType: CustomTypeSM;
  }
>();

export const renameCustomTypeCreator = createAsyncAction(
  "CUSTOM_TYPES/RENAME.REQUEST",
  "CUSTOM_TYPES/RENAME.RESPONSE",
  "CUSTOM_TYPES/RENAME.FAILURE"
)<
  {
    customTypeId: string;
    newCustomTypeName: string;
  },
  {
    customTypeId: string;
    newCustomTypeName: string;
  }
>();

export const deleteCustomTypeCreator = createAsyncAction(
  "CUSTOM_TYPES/DELETE.REQUEST",
  "CUSTOM_TYPES/DELETE.RESPONSE",
  "CUSTOM_TYPES/DELETE.FAILURE"
)<
  {
    customTypeId: string;
    customTypeName: string;
  },
  {
    customTypeId: string;
  }
>();

type CustomTypesActions =
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof createCustomTypeCreator>
  | ActionType<typeof renameCustomTypeCreator>
  | ActionType<typeof saveCustomTypeCreator>
  | ActionType<typeof pushCustomTypeCreator>
  | ActionType<typeof deleteCustomTypeCreator>
  | ActionType<typeof deleteSliceCreator.success>;

// Selectors
export const selectAllCustomTypes = (
  store: SliceMachineStoreType
): LocalOrRemoteCustomType[] => Object.values(store.availableCustomTypes);

export const selectAllCustomTypeIds = (
  store: SliceMachineStoreType
): string[] => Object.keys(store.availableCustomTypes);

export const selectAllCustomTypeLabels = (
  store: SliceMachineStoreType
): string[] => {
  return Object.values(store.availableCustomTypes)
    .flatMap((localOrRemote) => {
      return Object.values(localOrRemote);
    })
    .reduce<string[]>((acc, ct) => {
      if (ct.label != undefined) return [...acc, ct.label];

      return acc;
    }, []);
};

export const selectCustomTypeById = (
  store: SliceMachineStoreType,
  id: string
): LocalOrRemoteCustomType | null => store.availableCustomTypes[id];

// Reducer
export const availableCustomTypesReducer: Reducer<
  AvailableCustomTypesStoreType | null,
  CustomTypesActions
> = (state, action) => {
  if (!state) return null;

  switch (action.type) {
    case getType(refreshStateCreator): {
      const normalizedNewCustomType = normalizeFrontendCustomTypes(
        action.payload.localCustomTypes,
        action.payload.remoteCustomTypes
      );

      return {
        ...state,
        ...normalizedNewCustomType,
      };
    }
    case getType(createCustomTypeCreator.success): {
      const normalizedNewCustomType = normalizeFrontendCustomType(
        action.payload.newCustomType
      );

      return {
        ...state,
        ...normalizedNewCustomType,
      };
    }

    case getType(saveCustomTypeCreator.success): {
      const localCustomType = action.payload.customType;

      return {
        ...state,
        [localCustomType.id]: {
          ...state[localCustomType.id],
          local: localCustomType,
        },
      };
    }

    case getType(pushCustomTypeCreator.success): {
      const customType = state[action.payload.customTypeId];

      // Rename only applies for custom type with local data
      if (!hasLocal(customType)) return state;

      const localCustomType: CustomTypeSM = customType.local;

      return {
        ...state,
        [customType.local.id]: {
          local: localCustomType,
          remote: localCustomType,
        },
      };
    }

    case getType(renameCustomTypeCreator.success): {
      const customType = state[action.payload.customTypeId];
      const newName = action.payload.newCustomTypeName;

      // Rename only applies for custom type with local data
      if (!hasLocal(customType)) return state;

      const newLocalCustomType = {
        ...customType.local,
        label: newName,
      };

      const newCustomType = {
        ...customType,
        local: newLocalCustomType,
      };

      return {
        ...state,
        [customType.local.id]: newCustomType,
      };
    }

    case getType(deleteCustomTypeCreator.success): {
      const customType = state[action.payload.customTypeId];

      if (hasLocalAndRemote(customType)) {
        const remoteOnlyCustomType: RemoteOnlyCustomType = omit(
          customType,
          "local"
        );
        return {
          ...state,
          [remoteOnlyCustomType.remote.id]: remoteOnlyCustomType,
        };
      } else if (hasLocal(customType)) {
        return omit(state, customType.local.id);
      }

      return state;
    }

    case getType(deleteSliceCreator.success): {
      const sliceId = action.payload.sliceId;

      const customTypesUpdated: AvailableCustomTypesStoreType = Object.entries(
        state
      )
        .map<[string, LocalOrRemoteCustomType]>(
          ([customTypeId, customType]) => {
            if (hasLocal(customType)) {
              // Filter only the local model
              const customTypeUpdated = {
                ...customType,
                local: filterSliceFromCustomType(customType.local, sliceId),
              };

              return [customTypeId, customTypeUpdated];
            }

            return [customTypeId, customType];
          }
        )
        .reduce<AvailableCustomTypesStoreType>(
          (acc, [customTypeId, customType]) => {
            return {
              ...acc,
              [customTypeId]: customType,
            };
          },
          {}
        );

      return customTypesUpdated;
    }

    default:
      return state;
  }
};

export function* createCustomTypeSaga({
  payload,
}: ReturnType<typeof createCustomTypeCreator.request>) {
  try {
    const newCustomType = createCustomType(
      payload.id,
      payload.label,
      payload.repeatable
    );
    yield call(saveCustomType, newCustomType, {});
    yield put(createCustomTypeCreator.success({ newCustomType }));
    yield put(modalCloseCreator());
    yield put(push(`/cts/${payload.id}`));
    yield put(
      openToasterCreator({
        content: "Custom type saved",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: "Internal Error: Custom type not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* renameCustomTypeSaga({
  payload,
}: ReturnType<typeof renameCustomTypeCreator.request>) {
  try {
    yield call(
      renameCustomType,
      payload.customTypeId,
      payload.newCustomTypeName
    );
    yield put(renameCustomTypeCreator.success(payload));
    yield put(modalCloseCreator());
    yield put(
      openToasterCreator({
        content: "Custom type updated",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: "Internal Error: Custom type not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* deleteCustomTypeSaga({
  payload,
}: ReturnType<typeof deleteCustomTypeCreator.request>) {
  try {
    yield call(deleteCustomType, payload.customTypeId);
    yield put(deleteCustomTypeCreator.success(payload));
    yield put(
      openToasterCreator({
        content: `Successfully deleted Custom Type “${payload.customTypeName}”`,
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const apiResponse = e.response?.data as DeleteCustomTypeResponse;
      if (apiResponse.type === "warning")
        yield put(deleteCustomTypeCreator.success(payload));
      yield put(
        openToasterCreator({
          content: apiResponse.reason,
          type:
            apiResponse.type === "error"
              ? ToasterType.ERROR
              : ToasterType.WARNING,
        })
      );
    } else {
      yield put(
        openToasterCreator({
          content:
            "An unexpected error happened while deleting your custom type.",
          type: ToasterType.ERROR,
        })
      );
    }
  }
  yield put(modalCloseCreator());
}

// Saga watchers
function* handleCustomTypeRequests() {
  yield takeLatest(
    getType(createCustomTypeCreator.request),
    withLoader(createCustomTypeSaga, LoadingKeysEnum.CREATE_CUSTOM_TYPE)
  );
  yield takeLatest(
    getType(renameCustomTypeCreator.request),
    withLoader(renameCustomTypeSaga, LoadingKeysEnum.RENAME_CUSTOM_TYPE)
  );
  yield takeLatest(
    getType(deleteCustomTypeCreator.request),
    withLoader(deleteCustomTypeSaga, LoadingKeysEnum.DELETE_CUSTOM_TYPE)
  );
}

// Saga Exports
export function* watchAvailableCustomTypesSagas() {
  yield fork(handleCustomTypeRequests);
}

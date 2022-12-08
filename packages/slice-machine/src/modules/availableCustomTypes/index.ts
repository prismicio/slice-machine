import { Reducer } from "redux";
import {
  AvailableCustomTypesStoreType,
  FrontEndCustomType,
  getCustomTypeProp,
  isDeletedCustomType,
  isNewCustomType,
  isSyncedCustomType,
} from "./types";
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
import { ModalKeysEnum } from "@src/modules/modal/types";
import { push } from "connected-next-router";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import {
  normalizeFrontendCustomType,
  normalizeFrontendCustomTypes,
} from "@src/normalizers/customType";
import { saveCustomTypeCreator } from "../selectedCustomType/actions";
import { pushCustomTypeCreator } from "../pushChangesSaga/actions";
import axios from "axios";
import { DeleteCustomTypeResponse } from "@lib/models/common/CustomType";
import { omit } from "lodash";
import { deleteSliceCreator } from "../slices";
import { filterSliceFromCustomType } from "@lib/utils/shared/customTypes";
import { isLocalCustomType } from "@src/modules/availableCustomTypes/types";

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
): FrontEndCustomType[] => Object.values(store.availableCustomTypes);

export const selectAllCustomTypeIds = (
  store: SliceMachineStoreType
): string[] => Object.keys(store.availableCustomTypes);

export const selectAllCustomTypeLabels = (
  store: SliceMachineStoreType
): string[] => {
  return Object.values(store.availableCustomTypes)
    .flatMap((localAndRemote) => {
      return Object.values(localAndRemote);
    })
    .reduce<string[]>((acc, ct) => {
      if (ct?.label) return [...acc, ct.label];

      return acc;
    }, []);
};

export const selectCustomTypeById = (
  store: SliceMachineStoreType,
  id: string
): FrontEndCustomType | null => store.availableCustomTypes[id];

export const selectCustomTypeCount = (store: SliceMachineStoreType): number =>
  Object.values(store.availableCustomTypes).length;

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
      if (!state) return state;
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
      if (!state) return state;
      const customTypeId = action.payload.customTypeId;
      const customType = state[customTypeId];

      if (!isLocalCustomType(customType)) {
        // You can't create a deleted custom type
        return state;
      }
      const localCustomType: CustomTypeSM = customType.local;

      return {
        ...state,
        [customTypeId]: {
          local: localCustomType,
          remote: localCustomType,
        },
      };
    }

    case getType(renameCustomTypeCreator.success): {
      const id = action.payload.customTypeId;
      const newName = action.payload.newCustomTypeName;
      const ct = state[id];
      if (isDeletedCustomType(ct)) {
        // You can't rename a deleted custom type
        return state;
      }
      const newLocalCustomType = {
        ...ct.local,
        label: newName,
      };

      const newCustomType = {
        ...ct,
        local: newLocalCustomType,
      };

      return {
        ...state,
        [id]: newCustomType,
      };
    }

    case getType(deleteCustomTypeCreator.success): {
      const ct = state[action.payload.customTypeId];

      if (isNewCustomType(ct)) {
        return omit(state, action.payload.customTypeId);
      }

      if (isSyncedCustomType(ct)) {
        return {
          ...state,
          [ct.local.id]: omit(ct, "local"),
        };
      }

      return state;
    }

    case getType(deleteSliceCreator.success): {
      const sliceId = action.payload.sliceId;
      const newCTs = Object.entries(state)
        .map<[string, FrontEndCustomType]>(([ctName, customType]) => {
          const newCT = isNewCustomType(customType)
            ? {
                local: filterSliceFromCustomType(customType.local, sliceId),
              }
            : {
                local: filterSliceFromCustomType(customType.local, sliceId),
                remote: customType.remote,
              };

          return [ctName, newCT];
        })
        .reduce<AvailableCustomTypesStoreType>((acc, [name, ct]) => {
          return {
            ...acc,
            [name]: ct,
          };
        }, {});

      return newCTs;
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
    yield put(
      modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE })
    );
    yield put(push(`/cts/${payload.id}`));
    yield put(
      openToasterCreator({
        message: "Custom type saved",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Custom type not saved",
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
    yield put(
      modalCloseCreator({ modalKey: ModalKeysEnum.RENAME_CUSTOM_TYPE })
    );
    yield put(
      openToasterCreator({
        message: "Custom type updated",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Custom type not saved",
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
        message: `Successfully deleted Custom Type “${payload.customTypeName}”`,
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
          message: apiResponse.reason,
          type:
            apiResponse.type === "error"
              ? ToasterType.ERROR
              : ToasterType.WARNING,
        })
      );
    } else {
      yield put(
        openToasterCreator({
          message:
            "An unexpected error happened while deleting your custom type.",
          type: ToasterType.ERROR,
        })
      );
    }
  }
  yield put(modalCloseCreator({ modalKey: ModalKeysEnum.DELETE_CUSTOM_TYPE }));
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

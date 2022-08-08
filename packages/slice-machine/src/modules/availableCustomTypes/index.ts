import { Reducer } from "redux";
import { AvailableCustomTypesStoreType, FrontEndCustomType } from "./types";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { refreshStateCreator } from "@src/modules/environment";
import { call, fork, put, takeLatest } from "redux-saga/effects";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { renameCustomType, saveCustomType } from "@src/apiClient";
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
import { CustomTypeStatus } from "../selectedCustomType/types";

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

type CustomTypesActions =
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof createCustomTypeCreator>
  | ActionType<typeof renameCustomTypeCreator>;

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
    .reduce((acc, ct) => {
      if (ct.label) return [...acc, ct.label];

      return acc;
    }, [] as string[]);
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
      action.payload.newCustomType.__status = CustomTypeStatus.New;

      const normalizedNewCustomType = normalizeFrontendCustomType(
        action.payload.newCustomType
      );

      return {
        ...state,
        ...normalizedNewCustomType,
      };
    }
    case getType(renameCustomTypeCreator.success): {
      const id = action.payload.customTypeId;
      const newName = action.payload.newCustomTypeName;

      const newCustomType = {
        ...state[id],
        local: { ...state[id].local, label: newName },
      };

      return {
        ...state,
        [id]: newCustomType,
      };
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
}

// Saga Exports
export function* watchAvailableCustomTypesSagas() {
  yield fork(handleCustomTypeRequests);
}

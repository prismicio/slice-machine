import { Reducer } from "redux";
import { AvailableCustomTypesStoreType, FrontEndCustomType } from "./types";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { refreshStateCreator } from "@src/modules/environment";
import { call, fork, put, select, takeLatest } from "redux-saga/effects";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { renameCustomType, saveCustomType } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { push } from "connected-next-router";
import { createCustomType } from "@src/modules/availableCustomTypes/factory";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import {
  normalizeFrontendCustomType,
  normalizeFrontendCustomTypes,
} from "@src/normalizers/customType";
import { saveCustomTypeCreator } from "../selectedCustomType/actions";
import { pushCustomTypeCreator } from "../pushChangesSaga/actions";

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
    renamedCustomType: CustomTypeSM;
  }
>();

type CustomTypesActions =
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof createCustomTypeCreator>
  | ActionType<typeof renameCustomTypeCreator>
  | ActionType<typeof saveCustomTypeCreator>
  | ActionType<typeof pushCustomTypeCreator>;

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
      const localCustomType: CustomTypeSM = state[customTypeId].local;

      return {
        ...state,
        [customTypeId]: {
          local: localCustomType,
          remote: localCustomType,
        },
      };
    }

    case getType(renameCustomTypeCreator.success): {
      const id = action.payload.renamedCustomType.id;

      const newCustomType = {
        ...state[id],
        local: action.payload.renamedCustomType,
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
    yield call(saveCustomType, newCustomType);
    yield put(createCustomTypeCreator.success({ newCustomType }));
    yield put(modalCloseCreator());
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
    const customType = (yield select(
      selectCustomTypeById,
      payload.customTypeId
    )) as ReturnType<typeof selectCustomTypeById>;
    if (!customType) {
      throw new Error(`Custom Type "${payload.newCustomTypeName} not found.`);
    }

    const renamedCustomType = renameCustomTypeModel({
      customType: customType.local,
      newName: payload.newCustomTypeName,
    });

    yield call(renameCustomType, renamedCustomType);
    yield put(renameCustomTypeCreator.success({ renamedCustomType }));
    yield put(modalCloseCreator());
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

type RenameCustomTypeModelArgs = {
  customType: CustomTypeSM;
  newName: string;
};

export function renameCustomTypeModel(
  args: RenameCustomTypeModelArgs
): CustomTypeSM {
  return {
    ...args.customType,
    label: args.newName,
  };
}

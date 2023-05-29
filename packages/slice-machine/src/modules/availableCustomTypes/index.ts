import { Reducer } from "redux";
import { AvailableCustomTypesStoreType } from "./types";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { refreshStateCreator } from "@src/modules/environment";
import {
  call,
  fork,
  put,
  SagaReturnType,
  select,
  takeLatest,
} from "redux-saga/effects";
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
import { CustomTypeSM } from "@lib/models/common/CustomType";
import {
  normalizeFrontendCustomType,
  normalizeFrontendCustomTypes,
} from "@lib/models/common/normalizers/customType";
import { saveCustomTypeCreator } from "../selectedCustomType/actions";
import { omit } from "lodash";
import { deleteSliceCreator } from "../slices";
import { filterSliceFromCustomType } from "@lib/utils/shared/customTypes";
import {
  LocalOrRemoteCustomType,
  RemoteOnlyCustomType,
  hasLocal,
  hasLocalAndRemote,
} from "@lib/models/common/ModelData";
import { CustomTypeFormat } from "@slicemachine/manager/*";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";

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
    format: CustomTypeFormat;
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
    format: CustomTypeFormat;
    newCustomTypeName: string;
  },
  {
    renamedCustomType: CustomTypeSM;
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
    format: CustomTypeFormat;
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

    case getType(renameCustomTypeCreator.success): {
      const id = action.payload.renamedCustomType.id;
      const customType = state[id];

      // Rename only applies for custom type with local data
      if (!hasLocal(customType)) return state;

      const newCustomType = {
        ...customType,
        local: action.payload.renamedCustomType,
      };

      return {
        ...state,
        [id]: newCustomType,
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
        return omit(state, action.payload.customTypeId);
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
  const customTypesConfig = CUSTOM_TYPES_CONFIG[payload.format];

  try {
    const newCustomType = createCustomType(
      payload.id,
      payload.label,
      payload.repeatable,
      payload.format
    );
    yield call(saveCustomType, newCustomType);
    yield put(createCustomTypeCreator.success({ newCustomType }));
    yield put(modalCloseCreator());
    yield put(push(`/${customTypesConfig.urlPathSegment}/${payload.id}`));
    yield put(
      openToasterCreator({
        content: `${customTypesConfig.name({
          start: true,
          plural: false,
        })} saved`,
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: `Internal Error: ${customTypesConfig.name({
          start: true,
          plural: false,
        })} not saved`,
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* renameCustomTypeSaga({
  payload,
}: ReturnType<typeof renameCustomTypeCreator.request>) {
  const customTypesConfig = CUSTOM_TYPES_CONFIG[payload.format];

  try {
    const customType = (yield select(
      selectCustomTypeById,
      payload.customTypeId
    )) as ReturnType<typeof selectCustomTypeById>;
    if (!customType) {
      throw new Error(
        `${customTypesConfig.name({ start: true, plural: false })} "${
          payload.newCustomTypeName
        } not found.`
      );
    }

    if (!hasLocal(customType)) {
      throw new Error(
        `Can't rename a deleted ${customTypesConfig.name({
          start: false,
          plural: false,
        })} (${payload.newCustomTypeName})`
      );
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
        content: `${customTypesConfig.name({
          start: true,
          plural: false,
        })} updated`,
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: `Internal Error: ${customTypesConfig.name({
          start: true,
          plural: false,
        })} not saved`,
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* deleteCustomTypeSaga({
  payload,
}: ReturnType<typeof deleteCustomTypeCreator.request>) {
  const customTypesConfig = CUSTOM_TYPES_CONFIG[payload.format];

  try {
    const result = (yield call(
      deleteCustomType,
      payload.customTypeId
    )) as SagaReturnType<typeof deleteCustomType>;
    if (result.errors.length > 0) {
      throw result.errors;
    }
    yield put(deleteCustomTypeCreator.success(payload));
    yield put(
      openToasterCreator({
        content: `Successfully deleted ${customTypesConfig.name({
          start: false,
          plural: false,
        })} “${payload.customTypeName}”`,
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: `An unexpected error happened while deleting your ${customTypesConfig.name(
          { start: false, plural: false }
        )}.`,
        type: ToasterType.ERROR,
      })
    );
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

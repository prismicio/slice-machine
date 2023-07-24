import { Reducer } from "redux";
import { AvailableCustomTypesStoreType } from "./types";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { refreshStateCreator } from "@src/modules/environment";
import { call, fork, put, takeLatest } from "redux-saga/effects";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { saveCustomType } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { push } from "connected-next-router";
import { createCustomType } from "@src/features/customTypes/customTypesTable/createCustomType";
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
import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { CustomTypes } from "@lib/models/common/CustomType";
import { ToastMessageWithPath } from "@components/ToasterContainer";

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

export const renameAvailableCustomType = createAction(
  "CUSTOM_TYPES/RENAME_CUSTOM_TYPE"
)<{
  renamedCustomType: CustomTypeSM;
}>();

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
  | ActionType<typeof renameAvailableCustomType>
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

    case getType(renameAvailableCustomType): {
      const id = action.payload.renamedCustomType.id;
      const customType = state[id];

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
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[payload.format];

  try {
    const newCustomType = CustomTypes.toSM(
      createCustomType(
        payload.id,
        payload.label,
        payload.repeatable,
        payload.format
      )
    );
    yield call(saveCustomType, newCustomType);
    yield put(createCustomTypeCreator.success({ newCustomType }));
    yield put(modalCloseCreator());
    yield put(push(customTypesConfig.getBuilderPagePathname(payload.id)));
    yield put(
      openToasterCreator({
        content: ToastMessageWithPath({
          message: `${customTypesMessages.name({
            start: true,
            plural: false,
          })} saved successfully at `,
          path: `./customtypes/${newCustomType.id}/index.json`,
        }),
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        content: `Internal Error: ${customTypesMessages.name({
          start: true,
          plural: false,
        })} not saved`,
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
}

// Saga Exports
export function* watchAvailableCustomTypesSagas() {
  yield fork(handleCustomTypeRequests);
}

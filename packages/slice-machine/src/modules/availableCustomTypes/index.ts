import { omit } from "lodash";
import { Reducer } from "redux";
import { ActionType, createAction, getType } from "typesafe-actions";

import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";
import {
  hasLocal,
  hasLocalAndRemote,
  LocalOrRemoteCustomType,
  RemoteOnlyCustomType,
} from "@/legacy/lib/models/common/ModelData";
import {
  normalizeFrontendCustomType,
  normalizeFrontendCustomTypes,
} from "@/legacy/lib/models/common/normalizers/customType";
import { filterSliceFromCustomType } from "@/legacy/lib/utils/shared/customTypes";
import { refreshStateCreator } from "@/modules/environment";
import { SliceMachineStoreType } from "@/redux/type";

import { sliceDeleteSuccess } from "../slices";
import { AvailableCustomTypesStoreType } from "./types";

// Action Creators
export const customTypeSaveSuccess = createAction("CUSTOM_TYPE/SAVE_SUCCESS")<{
  newCustomType: CustomTypeSM;
}>();

export const customTypeCreateSuccess = createAction(
  "CUSTOM_TYPES/CREATE_SUCCESS",
)<{
  newCustomType: CustomTypeSM;
}>();

export const customTypeRenameSuccess = createAction(
  "CUSTOM_TYPES/RENAME_SUCCESS",
)<{
  renamedCustomType: CustomTypeSM;
}>();

export const customTypeDeleteSuccess = createAction(
  "CUSTOM_TYPES/DELETE_SUCCESS",
)<{
  customTypeId: string;
}>();

type CustomTypesActions =
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof customTypeCreateSuccess>
  | ActionType<typeof customTypeRenameSuccess>
  | ActionType<typeof customTypeSaveSuccess>
  | ActionType<typeof customTypeDeleteSuccess>
  | ActionType<typeof sliceDeleteSuccess>;

// Selectors
export const selectAllCustomTypes = (
  store: SliceMachineStoreType,
): LocalOrRemoteCustomType[] => Object.values(store.availableCustomTypes);

export const selectAllCustomTypeIds = (
  store: SliceMachineStoreType,
): string[] => Object.keys(store.availableCustomTypes);

export const selectAllCustomTypeLabels = (
  store: SliceMachineStoreType,
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
  id: string,
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
        action.payload.remoteCustomTypes,
      );

      return {
        ...normalizedNewCustomType,
      };
    }
    case getType(customTypeCreateSuccess): {
      const normalizedNewCustomType = normalizeFrontendCustomType(
        action.payload.newCustomType,
      );

      return {
        ...state,
        ...normalizedNewCustomType,
      };
    }

    case getType(customTypeSaveSuccess): {
      const localCustomType = action.payload.newCustomType;

      return {
        ...state,
        [localCustomType.id]: {
          ...state[localCustomType.id],
          local: localCustomType,
        },
      };
    }

    case getType(customTypeRenameSuccess): {
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

    case getType(customTypeDeleteSuccess): {
      const customType = state[action.payload.customTypeId];

      if (hasLocalAndRemote(customType)) {
        const remoteOnlyCustomType: RemoteOnlyCustomType = omit(
          customType,
          "local",
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

    case getType(sliceDeleteSuccess): {
      const sliceId = action.payload.sliceId;

      const customTypesUpdated: AvailableCustomTypesStoreType = Object.entries(
        state,
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
          },
        )
        .reduce<AvailableCustomTypesStoreType>(
          (acc, [customTypeId, customType]) => {
            return {
              ...acc,
              [customTypeId]: customType,
            };
          },
          {},
        );

      return customTypesUpdated;
    }

    default:
      return state;
  }
};

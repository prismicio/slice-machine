import { Reducer } from "redux";
import { CustomTypesStoreType } from "./types";
import { ActionType, createAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { CustomTypeState } from "@models/ui/CustomTypeState";

const initialState: CustomTypesStoreType = {
  localCustomTypes: [],
  remoteCustomTypes: [],
};

// Action Creators
export const getCustomTypesCreator = createAction("CUSTOM_TYPES/GET.RESPONSE")<{
  localCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
  remoteCustomTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
}>();

export const saveCustomTypesCreator = createAction(
  "CUSTOM_TYPES/SAVE.RESPONSE"
)<{
  modelPayload: CustomTypeState;
}>();

export const createCustomTypesCreator = createAction(
  "CUSTOM_TYPES/CREATE.RESPONSE"
)<{
  id: string;
  label: string;
  repeatable: boolean;
}>();

type CustomTypesActions =
  | ActionType<typeof getCustomTypesCreator>
  | ActionType<typeof saveCustomTypesCreator>
  | ActionType<typeof createCustomTypesCreator>;

// Selectors
export const getLocalCustomTypes = (store: SliceMachineStoreType) =>
  store.customTypes.localCustomTypes;

export const getRemoteCustomTypes = (store: SliceMachineStoreType) =>
  store.customTypes.remoteCustomTypes;

// Reducer
export const customTypesReducer: Reducer<
  CustomTypesStoreType,
  CustomTypesActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(getCustomTypesCreator):
      return {
        ...state,
        ...action.payload,
      };
    case getType(saveCustomTypesCreator):
      return {
        ...state,
        localCustomTypes: state.localCustomTypes.map((ct) => {
          if (ct.id === action.payload.modelPayload.current.id) {
            return CustomType.toObject(action.payload.modelPayload.current);
          }
          return ct;
        }),
      };
    case getType(createCustomTypesCreator):
      return {
        ...state,
        localCustomTypes: [
          {
            id: action.payload.id,
            label: action.payload.label,
            repeatable: action.payload.repeatable,
            tabs: {
              Main: {
                key: "Main",
                value: {},
              },
            },
            status: true,
          },
          ...state.localCustomTypes,
        ],
      };
    default:
      return state;
  }
};

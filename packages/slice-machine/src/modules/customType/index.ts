import { Reducer } from "redux";
import { CustomTypesStoreType } from "./types";
import { ActionType, createAction, getType } from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { CustomTypeState } from "@models/ui/CustomTypeState";
import { getStateCreator } from "@src/modules/environment";

const initialState: CustomTypesStoreType = {
  localCustomTypes: [],
  remoteCustomTypes: [],
};

// Action Creators
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
  | ActionType<typeof getStateCreator>
  | ActionType<typeof saveCustomTypesCreator>
  | ActionType<typeof createCustomTypesCreator>;

// Selectors
export const getLocalCustomTypes = (store: SliceMachineStoreType) =>
  store.customTypes.localCustomTypes;

export const getLocalCustomTypesCount = (store: SliceMachineStoreType) =>
  !!store.customTypes.localCustomTypes
    ? store.customTypes.localCustomTypes.length
    : 0;

export const getRemoteCustomTypes = (store: SliceMachineStoreType) =>
  store.customTypes.remoteCustomTypes;

// Factory
const createCustomType = (
  id: string,
  label: string,
  repeatable: boolean
): CustomType<ObjectTabs> => ({
  id,
  label,
  repeatable,
  tabs: {
    Main: {
      key: "Main",
      value: {},
    },
  },
  status: true,
});

// Reducer
export const customTypesReducer: Reducer<
  CustomTypesStoreType,
  CustomTypesActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(getStateCreator):
      return {
        ...state,
        remoteCustomTypes: action.payload.remoteCustomTypes,
        localCustomTypes: action.payload.localCustomTypes,
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
          createCustomType(
            action.payload.id,
            action.payload.label,
            action.payload.repeatable
          ),
          ...state.localCustomTypes,
        ],
      };
    default:
      return state;
  }
};

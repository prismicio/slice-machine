import { Reducer } from "redux";
import { CustomTypesStoreType } from "./types";
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from "typesafe-actions";
import { SliceMachineStoreType } from "@src/redux/type";
import { CustomType, ObjectTabs } from "@models/common/CustomType";
import { CustomTypeState } from "@models/ui/CustomTypeState";
import { getStateCreator } from "@src/modules/environment";
import { call, fork, put, takeLatest } from "redux-saga/effects";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { saveCustomType } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";

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

export const createCustomTypesCreator = createAsyncAction(
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
    newCustomType: CustomType<ObjectTabs>;
  }
>();

type CustomTypesActions =
  | ActionType<typeof getStateCreator>
  | ActionType<typeof saveCustomTypesCreator>
  | ActionType<typeof createCustomTypesCreator>;

// Selectors
export const selectLocalCustomTypes = (store: SliceMachineStoreType) =>
  store.customTypes.localCustomTypes;

export const selectRemoteCustomTypes = (store: SliceMachineStoreType) =>
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
    case getType(createCustomTypesCreator.success):
      return {
        ...state,
        localCustomTypes: [
          action.payload.newCustomType,
          ...state.localCustomTypes,
        ],
      };
    default:
      return state;
  }
};

function* createCustomTypeSaga({
  payload,
}: ReturnType<typeof createCustomTypesCreator.request>) {
  const newCustomType = createCustomType(
    payload.id,
    payload.label,
    payload.repeatable
  );
  yield call(saveCustomType, newCustomType, {});
  yield put(createCustomTypesCreator.success({ newCustomType }));
  yield put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE }));
}

// Saga watchers
function* watchCreateCustomType() {
  yield takeLatest(
    getType(createCustomTypesCreator.request),
    withLoader(createCustomTypeSaga, LoadingKeysEnum.CREATE_CUSTOM_TYPE)
  );
}

// Saga Exports
export function* watchCustomTypeSagas() {
  yield fork(watchCreateCustomType);
}

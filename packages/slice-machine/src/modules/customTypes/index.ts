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
import { push } from "connected-next-router";
import { createCustomType } from "@src/modules/customTypes/factory";

// Action Creators
export const saveCustomTypeCreator = createAction("CUSTOM_TYPES/SAVE.REQUEST")<{
  modelPayload: CustomTypeState;
}>();

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
    newCustomType: CustomType<ObjectTabs>;
  }
>();

type CustomTypesActions =
  | ActionType<typeof getStateCreator>
  | ActionType<typeof saveCustomTypeCreator>
  | ActionType<typeof createCustomTypeCreator>;

// Selectors
export const selectLocalCustomTypes = (store: SliceMachineStoreType) =>
  store.customTypes.localCustomTypes;

export const selectRemoteCustomTypes = (store: SliceMachineStoreType) =>
  store.customTypes.remoteCustomTypes;

// Reducer
export const customTypesReducer: Reducer<
  CustomTypesStoreType | null,
  CustomTypesActions
> = (state, action) => {
  if (!state) return null;

  switch (action.type) {
    case getType(getStateCreator):
      return {
        ...state,
        remoteCustomTypes: action.payload.remoteCustomTypes,
        localCustomTypes: action.payload.localCustomTypes,
      };
    case getType(saveCustomTypeCreator):
      return {
        ...state,
        localCustomTypes: state.localCustomTypes.map((ct) => {
          if (ct.id === action.payload.modelPayload.current.id) {
            return CustomType.toObject(action.payload.modelPayload.current);
          }
          return ct;
        }),
      };
    case getType(createCustomTypeCreator.success):
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

export function* createCustomTypeSaga({
  payload,
}: ReturnType<typeof createCustomTypeCreator.request>) {
  const newCustomType = createCustomType(
    payload.id,
    payload.label,
    payload.repeatable
  );
  yield call(saveCustomType, newCustomType, {});
  yield put(createCustomTypeCreator.success({ newCustomType }));
  yield put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_CUSTOM_TYPE }));
  yield put(push(`/cts/${payload.id}`));
}

// Saga watchers
function* watchCreateCustomType() {
  yield takeLatest(
    getType(createCustomTypeCreator.request),
    withLoader(createCustomTypeSaga, LoadingKeysEnum.CREATE_CUSTOM_TYPE)
  );
}

// Saga Exports
export function* watchCustomTypeSagas() {
  yield fork(watchCreateCustomType);
}

import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import type { VersionInfo } from "../../../server/src/api/versions";

const initialState: VersionInfo = {
  updateCommand: "",
  packageManager: "",
  update: false,
  current: "",
  recent: "",
  err: undefined,
};

export type UpdateVersionInfoStoreType = typeof initialState;

export const getUpdateNotificationCreator =
  createAction("UPDATE/VERSION.GET")<VersionInfo>();

export const getUpdateNotification = (state: SliceMachineStoreType) =>
  state.updateVersionInfo;

type UpdateVersionActions = ActionType<typeof getUpdateNotificationCreator>;

export const updateNotificationReducer: Reducer<
  VersionInfo,
  UpdateVersionActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(getUpdateNotificationCreator): {
      return { ...state, ...action.payload };
    }
    default:
      return state;
  }
};

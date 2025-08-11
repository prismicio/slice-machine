import { Reducer } from "redux";
import { ActionType, createAction, getType } from "typesafe-actions";

import ErrorWithStatus from "@/legacy/lib/models/common/ErrorWithStatus";
import { AuthStatus, UserContextStoreType } from "@/modules/userContext/types";
import { SliceMachineStoreType } from "@/redux/type";

import { refreshStateCreator } from "../environment";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  hasSeenSimulatorToolTip: false,
  hasSeenChangesToolTip: false,
  authStatus: AuthStatus.UNKNOWN,
  lastSyncChange: null,
};

// Actions Creators
export const hasSeenSimulatorToolTipCreator = createAction(
  "USER_CONTEXT/VIEW_SIMULATOR_TOOL_TIP",
)();

export const hasSeenChangesToolTipCreator = createAction(
  "USER_CONTEXT/VIEW_CHANGES_TOOL_TIP",
)();

export const changesPushSuccess = createAction(
  "USER_CONTEXT/CHANGES_PUSH_SUCCESS",
)();

type userContextActions = ActionType<
  | typeof hasSeenSimulatorToolTipCreator
  | typeof hasSeenChangesToolTipCreator
  | typeof refreshStateCreator
  | typeof changesPushSuccess
>;

// Selectors
export const userHasSeenSimulatorToolTip = (
  state: SliceMachineStoreType,
): boolean => state.userContext.hasSeenSimulatorToolTip || false;

export const userHasSeenChangesToolTip = (
  state: SliceMachineStoreType,
): boolean => state.userContext.hasSeenChangesToolTip || false;

export const getLastSyncChange = (
  state: SliceMachineStoreType,
): number | null => state.userContext.lastSyncChange;

// Reducer
export const userContextReducer: Reducer<
  UserContextStoreType,
  userContextActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(hasSeenSimulatorToolTipCreator): {
      return {
        ...state,
        hasSeenSimulatorToolTip: true,
      };
    }
    case getType(hasSeenChangesToolTipCreator): {
      return {
        ...state,
        hasSeenChangesToolTip: true,
      };
    }
    case getType(refreshStateCreator): {
      return {
        ...state,
        authStatus: getAuthStatus(action.payload.clientError),
      };
    }
    case getType(changesPushSuccess): {
      return {
        ...state,
        lastSyncChange: Date.now(),
      };
    }

    default:
      return state;
  }
};

const getAuthStatus = (
  clientError: ErrorWithStatus | undefined,
): AuthStatus => {
  switch (clientError?.status) {
    case undefined: {
      return AuthStatus.AUTHORIZED;
    }
    case 403: {
      return AuthStatus.FORBIDDEN;
    }
    case 401:
    // 401 (unauthorized) should not be handled here, but rather higher up and
    // the UI should be blocked (see _app.tsx)
    default: {
      return AuthStatus.UNKNOWN;
    }
  }
};

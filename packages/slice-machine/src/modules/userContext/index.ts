import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import {
  AuthStatus,
  UserContextStoreType,
} from "@src/modules/userContext/types";
import { refreshStateCreator } from "../environment";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";
import { changesPushCreator } from "../pushChangesSaga";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  hasSendAReview: false,
  updatesViewed: {
    latest: null,
    latestNonBreaking: null,
  },
  hasSeenTutorialsToolTip: false,
  hasSeenSimulatorToolTip: false,
  hasSeenChangesToolTip: false,
  authStatus: AuthStatus.UNKNOWN,
  lastSyncChange: null,
};

// Actions Creators
export const sendAReviewCreator = createAction("USER_CONTEXT/SEND_REVIEW")();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")();

export const updatesViewedCreator = createAction("USER_CONTEXT/VIEWED_UPDATES")<
  UserContextStoreType["updatesViewed"]
>();

export const hasSeenTutorialsToolTipCreator = createAction(
  "USER_CONTEXT/VIEW_TUTORIALS_TOOL_TIP"
)();

export const hasSeenSimulatorToolTipCreator = createAction(
  "USER_CONTEXT/VIEW_SIMULATOR_TOOL_TIP"
)();

export const hasSeenChangesToolTipCreator = createAction(
  "USER_CONTEXT/VIEW_CHANGES_TOOL_TIP"
)();

type userContextActions = ActionType<
  | typeof sendAReviewCreator
  | typeof skipReviewCreator
  | typeof updatesViewedCreator
  | typeof hasSeenTutorialsToolTipCreator
  | typeof hasSeenSimulatorToolTipCreator
  | typeof hasSeenChangesToolTipCreator
  | typeof refreshStateCreator
  | typeof changesPushCreator.success
>;

// Selectors
export const userHasSendAReview = (state: SliceMachineStoreType): boolean =>
  state.userContext.hasSendAReview;

export const getUpdatesViewed = (
  state: SliceMachineStoreType
): UserContextStoreType["updatesViewed"] => state.userContext.updatesViewed;

export const userHasSeenTutorialsToolTip = (
  state: SliceMachineStoreType
): boolean => state.userContext.hasSeenTutorialsToolTip || false;

export const userHasSeenSimulatorToolTip = (
  state: SliceMachineStoreType
): boolean => state.userContext.hasSeenSimulatorToolTip || false;

export const userHasSeenChangesToolTip = (
  state: SliceMachineStoreType
): boolean => state.userContext.hasSeenChangesToolTip || false;

export const getLastSyncChange = (
  state: SliceMachineStoreType
): number | null => state.userContext.lastSyncChange;

// Reducer
export const userContextReducer: Reducer<
  UserContextStoreType,
  userContextActions
> = (state = initialState, action) => {
  switch (action.type) {
    case getType(sendAReviewCreator):
    case getType(skipReviewCreator):
      return {
        ...state,
        hasSendAReview: true,
      };
    case getType(updatesViewedCreator): {
      return {
        ...state,
        updatesViewed: action.payload,
      };
    }
    case getType(hasSeenTutorialsToolTipCreator): {
      return {
        ...state,
        hasSeenTutorialsToolTip: true,
      };
    }
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
    case getType(changesPushCreator.success): {
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
  clientError: ErrorWithStatus | undefined
): AuthStatus => {
  switch (clientError?.status) {
    case undefined: {
      return AuthStatus.AUTHORIZED;
    }
    case 403: {
      return AuthStatus.UNAUTHORIZED;
    }
    case 401: {
      return AuthStatus.FORBIDDEN;
    }
    default: {
      return AuthStatus.UNKNOWN;
    }
  }
};

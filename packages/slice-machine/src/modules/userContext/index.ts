import { Reducer } from "redux";
import { ActionType, createAction, getType } from "typesafe-actions";

import ErrorWithStatus from "@/legacy/lib/models/common/ErrorWithStatus";
import {
  AuthStatus,
  UserContextStoreType,
  UserReviewState,
  UserReviewType,
} from "@/modules/userContext/types";
import { SliceMachineStoreType } from "@/redux/type";

import { refreshStateCreator } from "../environment";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  userReview: {
    onboarding: false,
    advancedRepository: false,
  },
  hasSeenTutorialsToolTip: false,
  hasSeenSimulatorToolTip: false,
  hasSeenChangesToolTip: false,
  authStatus: AuthStatus.UNKNOWN,
  lastSyncChange: null,
};

// Actions Creators
export const sendAReviewCreator = createAction("USER_CONTEXT/SEND_REVIEW")<{
  reviewType: UserReviewType;
}>();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")<{
  reviewType: UserReviewType;
}>();

export const hasSeenTutorialsToolTipCreator = createAction(
  "USER_CONTEXT/VIEW_TUTORIALS_TOOL_TIP",
)();

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
  | typeof sendAReviewCreator
  | typeof skipReviewCreator
  | typeof hasSeenTutorialsToolTipCreator
  | typeof hasSeenSimulatorToolTipCreator
  | typeof hasSeenChangesToolTipCreator
  | typeof refreshStateCreator
  | typeof changesPushSuccess
>;

// Selectors
export const getUserReview = (state: SliceMachineStoreType): UserReviewState =>
  state.userContext.userReview ?? {
    onboarding: state.userContext.hasSendAReview ?? false,
    advancedRepository: false,
  };

export const userHasSeenTutorialsToolTip = (
  state: SliceMachineStoreType,
): boolean => state.userContext.hasSeenTutorialsToolTip || false;

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
    case getType(sendAReviewCreator):
    case getType(skipReviewCreator):
      return {
        ...state,
        userReview: {
          ...state.userReview,
          [action.payload.reviewType]: true,
        },
      };
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

import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import {
  AuthStatus,
  UserContextStoreType,
} from "@src/modules/userContext/types";
import { refreshStateCreator } from "../environment";
import ErrorWithStatus from "@lib/models/common/ErrorWithStatus";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  hasSendAReview: false,
  isOnboarded: false,
  updatesViewed: {
    latest: null,
    latestNonBreaking: null,
  },
  hasSeenTutorialsTooTip: false,
  authStatus: AuthStatus.UNKNOWN,
};

// Actions Creators
export const sendAReviewCreator = createAction("USER_CONTEXT/SEND_REVIEW")();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")();

export const finishOnboardingCreator = createAction(
  "USER_CONTEXT/FINISH_ONBOARDING"
)();

export const updatesViewedCreator = createAction("USER_CONTEXT/VIEWED_UPDATES")<
  UserContextStoreType["updatesViewed"]
>();

export const hasSeenTutorialsTooTipCreator = createAction(
  "USER_CONTEXT/VIEW_TUTORIALS_TOOL_TIP"
)();

type userContextActions = ActionType<
  | typeof finishOnboardingCreator
  | typeof sendAReviewCreator
  | typeof skipReviewCreator
  | typeof updatesViewedCreator
  | typeof hasSeenTutorialsTooTipCreator
  | typeof refreshStateCreator
>;

// Selectors
export const userHasSendAReview = (state: SliceMachineStoreType): boolean =>
  state.userContext.hasSendAReview;

export const userHasDoneTheOnboarding = (
  state: SliceMachineStoreType
): boolean => state.userContext.isOnboarded;

export const getUpdatesViewed = (
  state: SliceMachineStoreType
): UserContextStoreType["updatesViewed"] => state.userContext.updatesViewed;

export const userHashasSeenTutorialsTooTip = (
  state: SliceMachineStoreType
): boolean => state.userContext.hasSeenTutorialsTooTip || false;

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
    case getType(finishOnboardingCreator):
      return {
        ...state,
        isOnboarded: true,
      };
    case getType(updatesViewedCreator): {
      return {
        ...state,
        updatesViewed: action.payload,
      };
    }
    case getType(hasSeenTutorialsTooTipCreator): {
      return {
        ...state,
        hasSeenTutorialsTooTip: true,
      };
    }
    case getType(refreshStateCreator): {
      return {
        ...state,
        authStatus: getAuthStatus(action.payload.clientError),
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

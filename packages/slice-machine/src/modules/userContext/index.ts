import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { getUpdateVersionInfo } from "../environment";
import { gte } from "semver";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  hasSendAReview: false,
  isOnboarded: false,
  dismissedUpdate: "",
};

// Actions Creators
export const sendAReviewCreator = createAction("USER_CONTEXT/SEND_REVIEW")();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")();

export const finishOnboardingCreator = createAction(
  "USER_CONTEXT/FINISH_ONBOARDING"
)();

export const dismissedUpdateCreator = createAction(
  "USER_CONTEXT/DISMISS_UPDATE"
)<UserContextStoreType["dismissedUpdate"]>();

type userContextActions = ActionType<
  | typeof finishOnboardingCreator
  | typeof sendAReviewCreator
  | typeof skipReviewCreator
  | typeof dismissedUpdateCreator
>;

// Selectors
export const userHasSendAReview = (state: SliceMachineStoreType): boolean =>
  state.userContext.hasSendAReview;

export const userHasDoneTheOnboarding = (
  state: SliceMachineStoreType
): boolean => state.userContext.isOnboarded;

export const dismissedLatestUpdate = (
  state: SliceMachineStoreType
): boolean => {
  const dismissed = state.userContext.dismissedUpdate;
  if (!dismissed) return false;
  const current = getUpdateVersionInfo(state);
  return gte(dismissed, current.latestVersion);
};

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
    case getType(dismissedUpdateCreator): {
      return {
        ...state,
        dismissedUpdate: action.payload,
      };
    }
    default:
      return state;
  }
};

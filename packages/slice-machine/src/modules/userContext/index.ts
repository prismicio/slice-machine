import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import type { UserContextStoreType } from "@src/modules/userContext/types";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  hasSendAReview: false,
  isOnboarded: false,
  updatesViewed: {
    latest: null,
    latestNonBreaking: null,
  },
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

type userContextActions = ActionType<
  | typeof finishOnboardingCreator
  | typeof sendAReviewCreator
  | typeof skipReviewCreator
  | typeof updatesViewedCreator
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
    default:
      return state;
  }
};

import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import type { UserContextStoreType } from "@src/modules/userContext/types";

// NOTE: Be careful every key written in this store is persisted in the localstorage

const initialState: UserContextStoreType = {
  hasSendAReview: false,
  isOnboarded: false,
  viewedUpdates: {
    patch: null,
    minor: null,
    major: null,
  },
};

// Actions Creators
export const sendAReviewCreator = createAction("USER_CONTEXT/SEND_REVIEW")();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")();

export const finishOnboardingCreator = createAction(
  "USER_CONTEXT/FINISH_ONBOARDING"
)();

export const viewedUpdatesCreator = createAction("USER_CONTEXT/VIEWED_UPDATES")<
  UserContextStoreType["viewedUpdates"]
>();

type userContextActions = ActionType<
  | typeof finishOnboardingCreator
  | typeof sendAReviewCreator
  | typeof skipReviewCreator
  | typeof viewedUpdatesCreator
>;

// Selectors
export const userHasSendAReview = (state: SliceMachineStoreType): boolean =>
  state.userContext.hasSendAReview;

export const userHasDoneTheOnboarding = (
  state: SliceMachineStoreType
): boolean => state.userContext.isOnboarded;

export const getVersionsTheUserKnowsAbout = (
  state: SliceMachineStoreType
): UserContextStoreType["viewedUpdates"] => state.userContext.viewedUpdates;

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
    case getType(viewedUpdatesCreator): {
      return {
        ...state,
        viewedUpdates: action.payload,
      };
    }
    default:
      return state;
  }
};

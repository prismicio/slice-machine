import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import { UserContextStoreType } from "@src/modules/userContext/types";

const initialState: UserContextStoreType = {
  hasSendAReview: false,
  isOnboarded: false,
};

// Actions Creators
export const sendAReviewCreator = createAction("USER_CONTEXT/SEND_REVIEW")();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")();

export const finishOnboardingCreator = createAction(
  "USER_CONTEXT/FINISH_ONBOARDING"
)();

type userContextActions = ActionType<
  | typeof finishOnboardingCreator
  | typeof sendAReviewCreator
  | typeof skipReviewCreator
>;

// Selectors
export const userHasSendAReview = (state: SliceMachineStoreType) =>
  state.userContext.hasSendAReview;

export const userHasDoneTheOnboarding = (state: SliceMachineStoreType) =>
  state.userContext.isOnboarded;

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
    default:
      return state;
  }
};

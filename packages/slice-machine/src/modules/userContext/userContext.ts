import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import { UserContextStoreType } from "@src/modules/userContext/types";

const initialState: UserContextStoreType = {
  hasSendAReview: false,
};

// Actions Creators
export const sendAReviewCreator = createAction("USER_CONTEXT/SEND_REVIEW")();

export const skipReviewCreator = createAction("USER_CONTEXT/SKIP_REVIEW")();

type userContextActions = ActionType<
  typeof sendAReviewCreator | typeof skipReviewCreator
>;

// Selectors
export const userHasSendAReview = (state: SliceMachineStoreType) =>
  state.userContext.hasSendAReview;

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
    default:
      return state;
  }
};

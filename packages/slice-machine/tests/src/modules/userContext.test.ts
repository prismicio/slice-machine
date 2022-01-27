import "@testing-library/jest-dom";

import {
  userContextReducer,
  sendAReviewCreator,
  skipReviewCreator,
  finishOnboardingCreator,
} from "@src/modules/userContext";
import { UserContextStoreType } from "@src/modules/userContext/types";

describe("[UserContext module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(userContextReducer({}, {})).toEqual({});
    });

    it("should return the initial state if no matching action", () => {
      expect(userContextReducer({}, { type: "NO.MATCH" })).toEqual({});
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/SEND_REVIEW action", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
      };

      const action = sendAReviewCreator();

      const expectedState = {
        hasSendAReview: true,
        isOnboarded: false,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/SKIP_REVIEW action", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
      };

      const action = skipReviewCreator();

      const expectedState = {
        hasSendAReview: true,
        isOnboarded: false,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/FINISH_ONBOARDING action", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
      };

      const action = finishOnboardingCreator();

      const expectedState = {
        hasSendAReview: false,
        isOnboarded: true,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });
  });
});

import "@testing-library/jest-dom";

import {
  userContextReducer,
  sendAReviewCreator,
  skipReviewCreator,
  finishOnboardingCreator,
  dismissedUpdateCreator,
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
        dismissedUpdate: "",
      };

      const action = sendAReviewCreator();

      const expectedState = {
        hasSendAReview: true,
        isOnboarded: false,
        dismissedUpdate: "",
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/SKIP_REVIEW action", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
        dismissedUpdate: "",
      };

      const action = skipReviewCreator();

      const expectedState = {
        hasSendAReview: true,
        isOnboarded: false,
        dismissedUpdate: "",
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/FINISH_ONBOARDING action", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
        dismissedUpdate: "",
      };

      const action = finishOnboardingCreator();

      const expectedState = {
        hasSendAReview: false,
        isOnboarded: true,
        dismissedUpdate: "",
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update dismissedUpdate to the value of the update dismissed", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
        dismissedUpdate: "",
      };

      const version = "0.1.2";

      const action = dismissedUpdateCreator(version);

      const expectedState = {
        ...initialState,
        dismissedUpdate: version,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });
  });
});

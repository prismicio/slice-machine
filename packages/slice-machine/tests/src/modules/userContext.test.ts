import "@testing-library/jest-dom";

import {
  userContextReducer,
  sendAReviewCreator,
  skipReviewCreator,
  finishOnboardingCreator,
  updatesViewedCreator,
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
        viewedUpdates: {
          patch: null,
          minor: null,
          major: null,
        },
      };

      const action = sendAReviewCreator();

      const expectedState = {
        ...initialState,
        hasSendAReview: true,
        isOnboarded: false,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/SKIP_REVIEW action", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
        viewedUpdates: {
          patch: null,
          minor: null,
          major: null,
        },
      };

      const action = skipReviewCreator();

      const expectedState = {
        ...initialState,
        hasSendAReview: true,
        isOnboarded: false,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/FINISH_ONBOARDING action", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
        viewedUpdates: {
          patch: null,
          minor: null,
          major: null,
        },
      };

      const action = finishOnboardingCreator();

      const expectedState = {
        ...initialState,
        hasSendAReview: false,
        isOnboarded: true,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update dismissedUpdate to the value of the update dismissed", () => {
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        isOnboarded: false,
        viewedUpdates: {
          patch: null,
          minor: null,
          major: null,
        },
      };

      const versions = { patch: "0.0.1", minor: "0.1.0", major: "1.0.0" };

      const action = updatesViewedCreator(versions);

      const expectedState = {
        ...initialState,
        viewedUpdates: versions,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  sendAReviewCreator,
  skipReviewCreator,
  userContextReducer,
} from "@/modules/userContext";
import { UserContextStoreType } from "@/modules/userContext/types";

describe("[UserContext module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(userContextReducer({}, {})).toEqual({});
    });

    it("should return the initial state if no matching action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(userContextReducer({}, { type: "NO.MATCH" })).toEqual({});
    });

    it("should update user review onboarding to true when given USER_CONTEXT/SEND_REVIEW action", () => {
      // @ts-expect-error TS(2739) FIXME: Type '{ hasSendAReview: false;... Remove this comment to see the full error message
      const initialState: UserContextStoreType = {
        userReview: {
          onboarding: false,
          advancedRepository: false,
        },
      };

      const action = sendAReviewCreator({
        reviewType: "onboarding",
      });

      const expectedState: UserContextStoreType = {
        ...initialState,
        userReview: {
          onboarding: true,
          advancedRepository: false,
        },
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update user review onboarding to true when given USER_CONTEXT/SKIP_REVIEW action", () => {
      // @ts-expect-error TS(2739) FIXME: Type '{ hasSendAReview: false;... Remove this comment to see the full error message
      const initialState: UserContextStoreType = {
        userReview: {
          onboarding: false,
          advancedRepository: false,
        },
      };

      const action = skipReviewCreator({
        reviewType: "onboarding",
      });

      const expectedState: UserContextStoreType = {
        ...initialState,
        userReview: {
          onboarding: true,
          advancedRepository: false,
        },
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });
  });
});

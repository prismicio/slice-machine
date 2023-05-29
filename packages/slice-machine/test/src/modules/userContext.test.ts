import { describe, expect, it } from "vitest";

import {
  userContextReducer,
  sendAReviewCreator,
  skipReviewCreator,
  updatesViewedCreator,
} from "@src/modules/userContext";
import { UserContextStoreType } from "@src/modules/userContext/types";

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

    it("should update hasSendAReview to true when given USER_CONTEXT/SEND_REVIEW action", () => {
      // @ts-expect-error TS(2739) FIXME: Type '{ hasSendAReview: false;... Remove this comment to see the full error message
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        updatesViewed: {
          latest: null,
          latestNonBreaking: null,
        },
      };

      const action = sendAReviewCreator();

      const expectedState = {
        ...initialState,
        hasSendAReview: true,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update hasSendAReview to true when given USER_CONTEXT/SKIP_REVIEW action", () => {
      // @ts-expect-error TS(2739) FIXME: Type '{ hasSendAReview: false;... Remove this comment to see the full error message
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        updatesViewed: {
          latest: null,
          latestNonBreaking: null,
        },
      };

      const action = skipReviewCreator();

      const expectedState = {
        ...initialState,
        hasSendAReview: true,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update dismissedUpdate to the value of the update dismissed", () => {
      // @ts-expect-error TS(2739) FIXME: Type '{ hasSendAReview: false;... Remove this comment to see the full error message
      const initialState: UserContextStoreType = {
        hasSendAReview: false,
        updatesViewed: {
          latest: null,
          latestNonBreaking: null,
        },
      };

      const versions = { latestNonBreaking: "0.1.0", latest: "1.0.0" };

      const action = updatesViewedCreator(versions);

      const expectedState = {
        ...initialState,
        updatesViewed: versions,
      };

      expect(userContextReducer(initialState, action)).toEqual(expectedState);
    });
  });
});

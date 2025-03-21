export enum AuthStatus {
  AUTHORIZED = "authorized",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  UNKNOWN = "unknown",
}

export type UserContextStoreType = {
  userReview: UserReviewState;
  hasSeenSimulatorToolTip: boolean;
  hasSeenChangesToolTip: boolean;
  authStatus: AuthStatus;
  lastSyncChange: number | null;
} & LegacyUserContextStoreType;

export type UserReviewState = {
  onboarding: boolean;
};

export type UserReviewType = keyof UserReviewState;

// Allow to handle old property that users can have
// in their local storage
type LegacyUserContextStoreType = {
  hasSendAReview?: boolean;
};

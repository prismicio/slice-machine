export enum AuthStatus {
  AUTHORIZED = "authorized",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  UNKNOWN = "unknown",
}

export type UserContextStoreType = {
  hasSendAReview: boolean;
  isOnboarded: boolean;
  updatesViewed: {
    latest: string | null;
    latestNonBreaking: string | null;
  };
  hasSeenTutorialsTooTip: boolean;
  authStatus: AuthStatus;
};

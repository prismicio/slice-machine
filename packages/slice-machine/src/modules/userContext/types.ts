export enum AuthStatus {
  AUTHORIZED = "authorized",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  UNKNOWN = "unknown",
}

export type UserContextStoreType = {
  hasSendAReview: boolean;
  updatesViewed: {
    latest: string | null;
    latestNonBreaking: string | null;
  };
  hasSeenTutorialsToolTip: boolean;
  hasSeenSimulatorToolTip: boolean;
  hasSeenChangesToolTip: boolean;
  authStatus: AuthStatus;
  lastSyncChange: number | null;
};

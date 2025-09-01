export enum AuthStatus {
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  UNKNOWN = "unknown",
}

export type UserContextStoreType = {
  hasSeenSimulatorToolTip: boolean;
  hasSeenChangesToolTip: boolean;
  authStatus: AuthStatus;
  lastSyncChange: number | null;
};

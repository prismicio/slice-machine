export enum AuthStatus {
  AUTHORIZED = "authorized",
  UNAUTHENTICATED = "unauthenticated",
  FORBIDDEN = "forbidden",
  UNKNOWN = "unknown",
}

export type UserContextStoreType = {
  hasSeenSimulatorToolTip: boolean;
  hasSeenChangesToolTip: boolean;
  authStatus: AuthStatus;
  lastSyncChange: number | null;
};

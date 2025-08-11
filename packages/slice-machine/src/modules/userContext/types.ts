export enum AuthStatus {
  AUTHORIZED = "authorized",
  /** User is not logged in. */
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  UNKNOWN = "unknown",
}

export type UserContextStoreType = {
  hasSeenSimulatorToolTip: boolean;
  hasSeenChangesToolTip: boolean;
  authStatus: AuthStatus;
  lastSyncChange: number | null;
};

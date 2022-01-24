export type LoadingStoreType = Record<LoadingKeysEnum, boolean>;

export enum LoadingKeysEnum {
  LOGIN = "LOGIN",
  REVIEW = "REVIEW",
  CHECK_SIMULATOR = "CHECK_SIMULATOR",
}

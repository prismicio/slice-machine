export type LoadingStoreType = Record<LoadingKeysEnum, boolean>;

export enum LoadingKeysEnum {
  LOGIN = "LOGIN",
  REVIEW = "REVIEW",
  CHECK_SIMULATOR = "CHECK_SIMULATOR",
  CHECK_SIMULATOR_IFRAME = "CHECK_SIMULATOR_IFRAME",
  SIMULATOR_SAVE_MOCK = "SIMULATOR_SAVE_MOCK",
}

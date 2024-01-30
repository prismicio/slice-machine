export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  RENAME_SLICE = "RENAME_SLICE",
  SCREENSHOT_PREVIEW = "SCREENSHOT_PREVIEW",
  SCREENSHOTS = "SCREENSHOTS",
  SIMULATOR_SETUP = "SIMULATOR_SETUP",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;

export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  SCREENSHOT_PREVIEW = "SCREENSHOT_PREVIEW",
  SCREENSHOTS = "SCREENSHOTS",
  SIMULATOR_SETUP = "SIMULATOR_SETUP",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;

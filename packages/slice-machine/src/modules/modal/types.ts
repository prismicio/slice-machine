export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  UPDATE_VERSION = "UPDATE_VERSION",
  CREATE_CUSTOM_TYPE = "CREATE_CUSTOM_TYPE",
  CREATE_SLICE = "CREATE_SLICE",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;

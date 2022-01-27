export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  UPDATE_VERSION = "UPDATE_VERSION",
  CREATE_CUSTOM_TYPE = "CREATE_CUSTOM_TYPE",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;

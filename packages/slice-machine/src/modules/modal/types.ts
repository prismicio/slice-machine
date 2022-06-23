export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  CREATE_CUSTOM_TYPE = "CREATE_CUSTOM_TYPE",
  RENAME_CUSTOM_TYPE = "RENAME_CUSTOM_TYPE",
  CREATE_SLICE = "CREATE_SLICE",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;

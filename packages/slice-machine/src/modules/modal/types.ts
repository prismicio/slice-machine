export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  NEW_VERSION = "NEW_VERSION",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;

export type UserContextStoreType = {
  hasSendAReview: boolean;
  isOnboarded: boolean;
};

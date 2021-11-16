export enum ModalKeysEnum {
  LOGIN = "LOGIN",
}

export type ModalStoreType = Record<ModalKeysEnum, boolean>;

export type UserContextStoreType = {
  hasSendAReview: boolean;
  isOnboarded: boolean;
};

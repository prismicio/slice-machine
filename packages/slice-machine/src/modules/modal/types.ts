import { SliceSM } from "@slicemachine/core/build/models";

export enum ModalKeysEnum {
  LOGIN = "LOGIN",
  CREATE_CUSTOM_TYPE = "CREATE_CUSTOM_TYPE",
  RENAME_CUSTOM_TYPE = "RENAME_CUSTOM_TYPE",
  CREATE_SLICE = "CREATE_SLICE",
  RENAME_SLICE = "RENAME_SLICE",
  SCREENSHOTS = "SCREENSHOTS",
}

type ModalStateWithPayload<P extends Record<string, unknown>> = {
  open: boolean;
  payload: P;
};

export type SliceVariationSelector = { sliceID: string; variationID: string };
export type ScreenshotModalState = ModalStateWithPayload<{
  sliceIds: SliceSM["id"][];
  defaultVariationSelected?: SliceVariationSelector;
}>;

export type ModalStoreType = {
  [ModalKeysEnum.LOGIN]: boolean;
  [ModalKeysEnum.CREATE_CUSTOM_TYPE]: boolean;
  [ModalKeysEnum.RENAME_CUSTOM_TYPE]: boolean;
  [ModalKeysEnum.CREATE_SLICE]: boolean;
  [ModalKeysEnum.RENAME_SLICE]: boolean;
  [ModalKeysEnum.SCREENSHOTS]: ScreenshotModalState;
};

import { ActionType, createAsyncAction } from "typesafe-actions";
import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";
import { ScreenshotTaken } from "@src/tracking/types";

export type SelectedSliceActions =
  | ActionType<typeof generateSliceScreenshotCreator>
  | ActionType<typeof generateSliceCustomScreenshotCreator>;

export const generateSliceScreenshotCreator = createAsyncAction(
  "SLICE/TAKE_SCREENSHOT.REQUEST",
  "SLICE/TAKE_SCREENSHOT.RESPONSE",
  "SLICE/TAKE_SCREENSHOT.FAILURE"
)<
  {
    variationId: string;
    component: ComponentUI;
    screenDimensions: ScreenDimensions;
    method: ScreenshotTaken["props"]["method"];
  },
  {
    variationId: string;
    screenshot: ScreenshotUI;
    component: ComponentUI;
  }
>();

export const generateSliceCustomScreenshotCreator = createAsyncAction(
  "SLICE/GENERATE_CUSTOM_SCREENSHOT.REQUEST",
  "SLICE/GENERATE_CUSTOM_SCREENSHOT.RESPONSE",
  "SLICE/GENERATE_CUSTOM_SCREENSHOT.FAILURE"
)<
  {
    variationId: string;
    component: ComponentUI;
    file: Blob;
    method: ScreenshotTaken["props"]["method"];
  },
  { variationId: string; screenshot: ScreenshotUI; component: ComponentUI }
>();

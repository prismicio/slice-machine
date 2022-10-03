import { ActionType, createAsyncAction } from "typesafe-actions";
import { ScreenDimensions } from "@lib/models/common/Screenshots";
import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";

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
  },
  { screenshot: ScreenshotUI | null; component: ComponentUI }
>();

export const generateSliceCustomScreenshotCreator = createAsyncAction(
  "SLICE/GENERATE_CUSTOM_SCREENSHOT.REQUEST",
  "SLICE/GENERATE_CUSTOM_SCREENSHOT.RESPONSE",
  "SLICE/GENERATE_CUSTOM_SCREENSHOT.FAILURE"
)<
  {
    variationId: string;
    component: ComponentUI;
    setData: (data: any) => void;
    file: Blob;
  },
  { variationId: string; screenshot: ScreenshotUI; component: ComponentUI }
>();

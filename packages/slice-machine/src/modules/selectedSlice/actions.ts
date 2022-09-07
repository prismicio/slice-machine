import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { Models } from "@slicemachine/core";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { Screenshots } from "@lib/models/common/Screenshots";
import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";
import { renameSliceCreator } from "../slices";
import { SelectedSliceStoreType } from "./types";
import { SliceBuilderState } from "../../../lib/builders/SliceBuilder";

export type SelectedSliceActions =
  | ActionType<typeof initSliceStoreCreator>
  | ActionType<typeof addSliceWidgetCreator>
  | ActionType<typeof replaceSliceWidgetCreator>
  | ActionType<typeof reorderSliceWidgetCreator>
  | ActionType<typeof removeSliceWidgetCreator>
  | ActionType<typeof updateSliceWidgetMockCreator>
  | ActionType<typeof deleteSliceWidgetMockCreator>
  | ActionType<typeof generateSliceScreenshotCreator>
  | ActionType<typeof generateSliceCustomScreenshotCreator>
  | ActionType<typeof saveSliceCreator>
  | ActionType<typeof pushSliceCreator>
  | ActionType<typeof copyVariationSliceCreator>
  | ActionType<typeof renameSliceCreator>;

export const initSliceStoreCreator =
  createAction("SLICE/INIT")<SelectedSliceStoreType>();

export const addSliceWidgetCreator = createAction("SLICE/ADD_WIDGET")<{
  variationId: string;
  widgetsArea: Models.WidgetsArea;
  key: string;
  value: NestableWidget;
}>();

export const replaceSliceWidgetCreator = createAction("SLICE/REPLACE_WIDGET")<{
  variationId: string;
  widgetsArea: Models.WidgetsArea;
  previousKey: string;
  newKey: string;
  value: NestableWidget;
}>();

export const reorderSliceWidgetCreator = createAction("SLICE/REORDER_WIDGET")<{
  variationId: string;
  widgetsArea: Models.WidgetsArea;
  start: number;
  end: number | undefined;
}>();

export const removeSliceWidgetCreator = createAction("SLICE/REMOVE_WIDGET")<{
  variationId: string;
  widgetsArea: Models.WidgetsArea;
  key: string;
}>();

export const updateSliceWidgetMockCreator = createAction(
  "SLICE/UPDATE_WIDGET_MOCK"
)<{
  variationId: string;
  mockConfig: SliceMockConfig;
  widgetArea: Models.WidgetsArea;
  previousKey: string;
  newKey: string;
  mockValue: any;
}>();

export const deleteSliceWidgetMockCreator = createAction(
  "SLICE/DELETE_WIDGET_MOCK"
)<{
  variationId: string;
  mockConfig: SliceMockConfig;
  widgetArea: Models.WidgetsArea;
  newKey: string;
}>();

export const generateSliceScreenshotCreator = createAsyncAction(
  "SLICE/TAKE_SCREENSHOT.REQUEST",
  "SLICE/TAKE_SCREENSHOT.RESPONSE",
  "SLICE/TAKE_SCREENSHOT.FAILURE"
)<
  {
    component: ComponentUI;
    setData: (data: any) => void;
  },
  { screenshots: Screenshots; component: ComponentUI }
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

export const saveSliceCreator = createAsyncAction(
  "SLICE/SAVE.REQUEST",
  "SLICE/SAVE.RESPONSE",
  "SLICE/SAVE.FAILURE"
)<
  {
    component: ComponentUI;
    setData: (data: any) => void;
  },
  {
    component: ComponentUI;
  }
>();

export const pushSliceCreator = createAsyncAction(
  "SLICE/PUSH.REQUEST",
  "SLICE/PUSH.RESPONSE",
  "SLICE/PUSH.FAILURE"
)<
  {
    component: ComponentUI;
    onPush: (data: SliceBuilderState) => void;
  },
  {
    component: ComponentUI;
    updatedScreenshotsUrls: Record<string, string | null>;
  },
  {
    component: ComponentUI;
  }
>();

export const copyVariationSliceCreator = createAction("SLICE/COPY_VARIATION")<{
  key: string;
  name: string;
  copied: Models.VariationSM;
}>();

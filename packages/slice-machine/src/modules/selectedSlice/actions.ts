import { ActionType, createAction } from "typesafe-actions";
import { Models } from "@slicemachine/core";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { Screenshots } from "@lib/models/common/Screenshots";
import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";
import { ExtendedComponentUI } from "./types";

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
  | ActionType<typeof copyVariationSliceCreator>;

export const initSliceStoreCreator =
  createAction("SLICE/INIT")<ExtendedComponentUI>();

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

export const generateSliceScreenshotCreator = createAction(
  "SLICE/GENERATE_SCREENSHOT"
)<{ screenshots: Screenshots; component: ComponentUI }>();

export const generateSliceCustomScreenshotCreator = createAction(
  "SLICE/GENERATE_CUSTOM_SCREENSHOT"
)<{ variationId: string; screenshot: ScreenshotUI; component: ComponentUI }>();

export const saveSliceCreator = createAction("SLICE/SAVE")<{
  extendedComponent: ExtendedComponentUI;
}>();

export const pushSliceCreator = createAction("SLICE/PUSH")<{
  extendedComponent: ExtendedComponentUI;
}>();

export const copyVariationSliceCreator = createAction("SLICE/COPY_VARIATION")<{
  key: string;
  name: string;
  copied: Models.VariationSM;
}>();

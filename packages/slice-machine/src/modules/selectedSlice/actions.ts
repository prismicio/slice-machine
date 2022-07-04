import { ActionType, createAction } from "typesafe-actions";
import SliceState from "@lib/models/ui/SliceState";
import { Models } from "@slicemachine/core";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { Screenshots } from "@lib/models/common/Screenshots";
import { ScreenshotUI } from "@lib/models/common/ComponentUI";

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

export const initSliceStoreCreator = createAction("SLICE/INIT")<{
  Model: SliceState;
}>();

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
)<{ screenshots: Screenshots }>();

export const generateSliceCustomScreenshotCreator = createAction(
  "SLICE/GENERATE_CUSTOM_SCREENSHOT"
)<{ variationId: string; screenshot: ScreenshotUI }>();

export const saveSliceCreator = createAction("SLICE/SAVE")<{
  state: SliceState;
}>();

export const pushSliceCreator = createAction("SLICE/PUSH")<undefined>();

export const copyVariationSliceCreator = createAction("SLICE/COPY_VARIATION")<{
  key: string;
  name: string;
  copied: Models.VariationSM;
}>();

import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { Models } from "@slicemachine/core";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { renameSliceCreator } from "../slices";
import { SelectedSliceStoreType } from "./types";
import { refreshStateCreator } from "../environment";

export type SelectedSliceActions =
  | ActionType<typeof initSliceStoreCreator>
  | ActionType<typeof addSliceWidgetCreator>
  | ActionType<typeof replaceSliceWidgetCreator>
  | ActionType<typeof reorderSliceWidgetCreator>
  | ActionType<typeof removeSliceWidgetCreator>
  | ActionType<typeof updateSliceWidgetMockCreator>
  | ActionType<typeof deleteSliceWidgetMockCreator>
  | ActionType<typeof saveSliceCreator>
  | ActionType<typeof copyVariationSliceCreator>
  | ActionType<typeof renameSliceCreator>
  | ActionType<typeof refreshStateCreator>;

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

export const copyVariationSliceCreator = createAction("SLICE/COPY_VARIATION")<{
  key: string;
  name: string;
  copied: Models.VariationSM;
}>();

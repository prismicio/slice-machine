import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { renameSliceCreator } from "../slices";
import { SelectedSliceStoreType } from "./types";
import { refreshStateCreator } from "../environment";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
} from "../screenshots/actions";
import { ComponentMocks } from "@lib/models/common/Library";
import { VariationSM, WidgetsArea } from "@lib/models/common/Slice";

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
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof generateSliceScreenshotCreator>
  | ActionType<typeof generateSliceCustomScreenshotCreator>
  | ActionType<typeof updateSelectedSliceMocks>;

export const updateSelectedSliceMocks = createAction(
  "SELECTED_SLICE/UPDATE_MOCKS"
)<{
  mocks: ComponentMocks;
}>();

export const initSliceStoreCreator =
  createAction("SLICE/INIT")<SelectedSliceStoreType>();

export const addSliceWidgetCreator = createAction("SLICE/ADD_WIDGET")<{
  variationId: string;
  widgetsArea: WidgetsArea;
  key: string;
  value: NestableWidget;
}>();

export const replaceSliceWidgetCreator = createAction("SLICE/REPLACE_WIDGET")<{
  variationId: string;
  widgetsArea: WidgetsArea;
  previousKey: string;
  newKey: string;
  value: NestableWidget;
}>();

export const reorderSliceWidgetCreator = createAction("SLICE/REORDER_WIDGET")<{
  variationId: string;
  widgetsArea: WidgetsArea;
  start: number;
  end: number | undefined;
}>();

export const removeSliceWidgetCreator = createAction("SLICE/REMOVE_WIDGET")<{
  variationId: string;
  widgetsArea: WidgetsArea;
  key: string;
}>();

export const updateSliceWidgetMockCreator = createAction(
  "SLICE/UPDATE_WIDGET_MOCK"
)<{
  variationId: string;
  widgetArea: WidgetsArea;
  previousKey: string;
  newKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockValue: any;
}>();

export const deleteSliceWidgetMockCreator = createAction(
  "SLICE/DELETE_WIDGET_MOCK"
)<{
  variationId: string;
  widgetArea: WidgetsArea;
  newKey: string;
}>();

export const saveSliceCreator = createAsyncAction(
  "SLICE/SAVE.REQUEST",
  "SLICE/SAVE.RESPONSE",
  "SLICE/SAVE.FAILURE"
)<
  {
    component: ComponentUI;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData: (data: any) => void;
  },
  {
    component: ComponentUI;
  }
>();

export const copyVariationSliceCreator = createAction("SLICE/COPY_VARIATION")<{
  key: string;
  name: string;
  copied: VariationSM;
}>();

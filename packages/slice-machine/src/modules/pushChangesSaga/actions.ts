import { createAsyncAction } from "typesafe-actions";
import { SliceBuilderState } from "../../../lib/builders/SliceBuilder";
import { ComponentUI } from "@lib/models/common/ComponentUI";

export const pushCustomTypeCreator = createAsyncAction(
  "CUSTOM_TYPE/PUSH.REQUEST",
  "CUSTOM_TYPE/PUSH.RESPONSE",
  "CUSTOM_TYPE/PUSH.FAILURE"
)<undefined, { customTypeId: string }, { customTypeId: string }>();

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

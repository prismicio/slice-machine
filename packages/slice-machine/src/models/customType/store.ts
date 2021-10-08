import Store from "@lib/models/ui/Store";
import Actions, {
  updateWidgetMockConfig,
  deleteWidgetMockConfig,
  updateWidgetGroupMockConfig,
  deleteWidgetGroupMockConfig,
} from "./actions";

import saveCustomType from "./actions/save";
import pushCustomType from "./actions/push";

import { Field } from "@lib/models/common/CustomType/fields";

export default class CustomTypeStore implements Store {
  constructor(
    readonly dispatch: ({
      type,
      payload,
    }: {
      type: string;
      payload?: any;
    }) => void
  ) {}

  createTab(id: string) {
    this.dispatch({ type: Actions.CreateTab, payload: { id } });
  }
  reset() {
    this.dispatch({ type: Actions.Reset });
  }
  save = saveCustomType(this.dispatch);
  push = pushCustomType(this.dispatch);
  updateWidgetMockConfig = updateWidgetMockConfig(this.dispatch);
  deleteWidgetMockConfig = deleteWidgetMockConfig(this.dispatch);
  updateWidgetGroupMockConfig = updateWidgetGroupMockConfig(this.dispatch);
  deleteWidgetGroupMockConfig = deleteWidgetGroupMockConfig(this.dispatch);
  tab(tabId: string) {
    return {
      update: (newKey: string) => {
        this.dispatch({
          type: Actions.UpdateTab,
          payload: { prevKey: tabId, newKey },
        });
      },
      delete: () => {
        this.dispatch({ type: Actions.DeleteTab, payload: { tabId } });
      },
      addWidget: (id: string, field: Field) => {
        this.dispatch({
          type: Actions.AddWidget,
          payload: { tabId, id, field },
        });
      },
      removeWidget: (id: string) => {
        this.dispatch({ type: Actions.RemoveWidget, payload: { tabId, id } });
      },
      replaceWidget: (previousKey: string, newKey: string, value: Field) => {
        this.dispatch({
          type: Actions.ReplaceWidget,
          payload: { tabId, previousKey, newKey, value },
        });
      },
      reorderWidget: (start: number, end: number) => {
        this.dispatch({
          type: Actions.ReorderWidget,
          payload: { tabId, start, end },
        });
      },
      createSliceZone: () => {
        this.dispatch({ type: Actions.CreateSliceZone, payload: { tabId } });
      },
      deleteSliceZone: () => {
        this.dispatch({ type: Actions.DeleteSliceZone, payload: { tabId } });
      },
      addSharedSlice: (sliceKey: string) => {
        this.dispatch({
          type: Actions.AddSharedSlice,
          payload: { tabId, sliceKey },
        });
      },
      replaceSharedSlices: (sliceKeys: [string], preserve: [string]) => {
        this.dispatch({
          type: Actions.ReplaceSharedSlices,
          payload: { tabId, sliceKeys, preserve },
        });
      },
      removeSharedSlice: (sliceKey: string) => {
        this.dispatch({
          type: Actions.RemoveSharedSlice,
          payload: { tabId, sliceKey },
        });
      },
      group: (groupId: string) => {
        return {
          addWidget: (id: string, field: Field) => {
            this.dispatch({
              type: Actions.GroupAddWidget,
              payload: { tabId, groupId, id, field },
            });
          },
          replaceWidget: (
            previousKey: string,
            newKey: string,
            value: Field
          ) => {
            this.dispatch({
              type: Actions.GroupReplaceWidget,
              payload: { tabId, groupId, previousKey, newKey, value },
            });
          },
          reorderWidget: (start: number, end: number) => {
            this.dispatch({
              type: Actions.GroupReorderWidget,
              payload: { tabId, groupId, start, end },
            });
          },
          deleteWidget: (key: string) => {
            this.dispatch({
              type: Actions.GroupDeleteWidget,
              payload: { tabId, groupId, key },
            });
          },
        };
      },
    };
  }
}

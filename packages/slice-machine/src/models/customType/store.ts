import Store from '@models/ui/Store'
import { Widget } from '@models/common/widgets'
import { GroupWidget, GroupAsArray } from '@models/common/CustomType/group'
import Actions, { updateWidgetMockConfig, deleteWidgetMockConfig } from './actions'

import saveCustomType from './actions/save'
import pushCustomType from './actions/push'

export default class CustomTypeStore implements Store {
  constructor(readonly dispatch: ({ type, payload }: { type: string, payload?: any }) => void) {}

  createTab() {
    this.dispatch({ type: Actions.CreateTab })
  }
  reset() {
    this.dispatch({ type: Actions.Reset })
  }
  save = saveCustomType(this.dispatch)
  push = pushCustomType(this.dispatch)
  tab(tabId: string) {
    return {
      addWidget: (id: string, widget: Widget | GroupWidget) => {
        this.dispatch({ type: Actions.AddWidget, payload: { tabId, id, widget } })
      },
      removeWidget: (id: string) => {
        this.dispatch({ type: Actions.RemoveWidget, payload: { tabId, id } })
      },
      replaceWidget: (previousKey: string, newKey: string, value: Widget | GroupAsArray) => {
        this.dispatch({ type: Actions.ReplaceWidget, payload: { tabId, previousKey, newKey, value } }) 
      },
      reorderWidget: (start: number, end: number) => {
        this.dispatch({ type: Actions.ReorderWidget, payload: { tabId, start, end }})
      },
      updateWidgetGroupMockConfig:(initialMockConfig: any, groupItemKey: string, prevId: string, newId: string, mockValue: any) => {
        console.log({ initialMockConfig, mockValue, newId })
        const updatedConfig = {
          ...initialMockConfig[groupItemKey],
          ...(prevId !== newId ? {
              [prevId]: undefined,
            } : null),
          [newId]: mockValue
        }
        updateWidgetMockConfig(this.dispatch)()(initialMockConfig, groupItemKey, groupItemKey, updatedConfig)
      },
      updateWidgetMockConfig: updateWidgetMockConfig(this.dispatch)(),
      deleteWidgetMockConfig: deleteWidgetMockConfig(this.dispatch)(),
      createSliceZone: () => {
        this.dispatch({ type: Actions.CreateSliceZone, payload: { tabId } })
      },
      deleteSliceZone: () => {
        this.dispatch({ type: Actions.DeleteSliceZone, payload: { tabId } })
      },
      delete: () => {
        this.dispatch({ type: Actions.DeleteTab, payload: { tabId } })
      },
      addSharedSlice: (sliceKey: string) => {
        this.dispatch({ type: Actions.AddSharedSlice, payload: { tabId, sliceKey } })
      },
      replaceSharedSlices: (sliceKeys: [string]) => {
        this.dispatch({ type: Actions.ReplaceSharedSlices, payload: { tabId, sliceKeys } })
      },
      removeSharedSlice: (sliceKey: string) => {
        this.dispatch({ type: Actions.RemoveSharedSlice, payload: { tabId, sliceKey } })
      },
      group: (groupId: string) => {
        return {
          addWidget: (id: string, widget: Widget) => {
            this.dispatch({ type: Actions.GroupAddWidget, payload: { tabId, groupId, id, widget } })
          },
          replaceWidget: (previousKey: string, newKey: string, value: Widget) => {
            this.dispatch({ type: Actions.GroupReplaceWidget, payload: { tabId, groupId, previousKey, newKey, value } })
          },
          reorderWidget: (start: number, end: number) => {
            this.dispatch({ type: Actions.GroupReorderWidget, payload: { tabId, groupId, start, end } })
          },
          deleteWidget: (key: string) => {
            this.dispatch({ type: Actions.GroupDeleteWidget, payload: { tabId, groupId, key } })
          },
        }
      }
    }
  }

}
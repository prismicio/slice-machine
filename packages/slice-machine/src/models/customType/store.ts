import Store from '../../../lib/models/ui/Store'
import { Widget } from '../../../lib/models/common/widgets'
import { GroupWidget, GroupAsArray } from '../../../lib/models/common/CustomType/group'
import Actions, { updateWidgetMockConfig, deleteWidgetMockConfig } from './actions'

import saveCustomType from './actions/save'
import pushCustomType from './actions/push'
import { group } from 'yargs'

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
          }
        }
      }
    }
  }

}
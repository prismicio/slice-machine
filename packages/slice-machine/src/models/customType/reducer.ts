import equal from 'fast-deep-equal'
import { CustomTypeState } from '../../../lib/models/ui/CustomTypeState'
import { Tab } from '../../../lib/models/common/CustomType/tab'

import Actions from './actions'
import { Widget } from '../../../lib/models/common/widgets'
import { GroupWidget, GroupAsArray } from '../../../lib/models/common/CustomType/group'
import { SliceZone, SliceZoneAsArray } from '../../../lib/models/common/CustomType/sliceZone'

export default function reducer(prevState: CustomTypeState, action: { type: string, payload?: unknown }): CustomTypeState {
  const result = ((): CustomTypeState => {
    switch(action.type) {
      case Actions.Reset: {
        return {
          ...prevState,
          tabs: prevState.initialTabs,
          mockConfig: prevState.initialMockConfig
        }
      }
      case Actions.CreateTab: {
        return {
          ...prevState,
          tabs: [...prevState.tabs, { key: 'NewTab', value: [], sliceZone: null }]
        }
      }
      case Actions.Save: {
        const { state } = action.payload as { state: CustomTypeState }
        return {
          ...state,
          initialTabs: state.tabs,
          initialMockConfig: state.mockConfig,
        }
      }
      case Actions.AddWidget: {
        const { tabId, widget, id } = action.payload as { tabId: string, widget: Widget | GroupWidget, id: string }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.addWidget(tab, id, widget))
      }
      case Actions.RemoveWidget: {
        const { tabId, id } = action.payload as { tabId: string, id: string }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.removeWidget(tab, id))
      }
      case Actions.ReplaceWidget: {
        const { tabId, previousKey, newKey, value } = action.payload as { tabId: string, previousKey: string, newKey: string, value: Widget | GroupAsArray }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.replaceWidget(tab, previousKey, newKey, value))
      }
      case Actions.ReorderWidget: {
        const { tabId, start, end } = action.payload as { tabId: string, start: number, end: number }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.reorderWidget(tab, start, end))
      }
      case Actions.DeleteTab: {
        const { tabId } = action.payload as { tabId: string }
        return CustomTypeState.deleteTab(prevState, tabId)
      }
      case Actions.CreateSliceZone: {
        const { tabId } = action.payload as { tabId: string }
        const key = `${tabId}SliceZone`
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.createSliceZone(tab, key))
      }
      case Actions.DeleteSliceZone: {
        const { tabId } = action.payload as { tabId: string }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.deleteSliceZone(tab))
      }
      case Actions.AddSharedSlice: {
        const { tabId, sliceKey } = action.payload as { tabId: string, sliceKey: string }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateSliceZone(tab)((sliceZone: SliceZoneAsArray) => SliceZone.addSharedSlice(sliceZone, sliceKey)))
      }
      case Actions.RemoveSharedSlice: {
        const { tabId, sliceKey } = action.payload as { tabId: string, sliceKey: string }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateSliceZone(tab)((sliceZone: SliceZoneAsArray) => SliceZone.removeSharedSlice(sliceZone, sliceKey)))
      }
      case Actions.UpdateWidgetMockConfig:
        return {
        ...prevState,
        mockConfig: (action.payload as any)
      }

      case Actions.DeleteWidgetMockConfig:
        return {
        ...prevState,
        mockConfig: (action.payload as any)
      }
      default: throw new Error("Invalid action.")
    }
  })()
  return {
    ...result,
    poolOfFieldsToCheck: CustomTypeState.getPool(result.tabs),
    isTouched: !equal(result.initialTabs, result.tabs) || !equal(result.initialMockConfig, result.mockConfig)
  }
}
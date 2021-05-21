import { CustomType } from '../common/CustomType'
import { TabsAsObject, TabsAsArray, TabAsArray, TabValueAsArray } from '../common/CustomType/tab'

export enum CustomTypeStatus {
  New = "NEW_CT",
  Modified = 'MODIFIED',
  Synced = 'SYNCED',
}

export interface CustomTypeState {
  id: string
  label: string
  status: boolean
  repeatable: boolean
  jsonModel: CustomType<TabsAsObject>
  tabs: TabsAsArray
  remoteTabs: TabsAsArray
  initialTabs: TabsAsArray
  mockConfig: any
  initialMockConfig: any
  poolOfFieldsToCheck: TabValueAsArray
  isTouched?: boolean
  __status?: CustomTypeStatus
}

export const CustomTypeState = {
  tab(state: CustomTypeState, tabId?: string): TabAsArray | undefined {
    if(state.tabs.length) {
      if(tabId) return state.tabs.find(v => v.key === tabId)
      return state.tabs[0]
    }
  },

  updateTab(state: CustomTypeState, tabId: string) {
    return (mutate: (v: TabAsArray) => TabAsArray): CustomTypeState => {
      const tabs = state.tabs.map(v => {
        if(v.key === tabId) return mutate(v)
        else return v
      })

      return {
        ...state,
        tabs
      }
    }
  },
  deleteTab(state: CustomTypeState, tabId: string) {
    const tabs = state.tabs.filter(v => v.key !== tabId)
    return {
      ...state,
      tabs
    }
  },
  getPool(tabs: TabsAsArray):TabValueAsArray {
    return tabs.reduce((acc: TabValueAsArray, curr: TabAsArray) => {
      return [...acc, ...curr.value]
    }, [])
  }
}
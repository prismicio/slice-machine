import { CustomType } from '../common/CustomType'
import { TabsAsArray, TabAsArray, TabValueAsArray } from '../common/CustomType/tab'

export enum CustomTypeStatus {
  New = "NEW_CT",
  Modified = 'MODIFIED',
  Synced = 'SYNCED',
}

export interface CustomTypeState {
  current: CustomType<TabsAsArray>,
  initialCustomType: CustomType<TabsAsArray>,
  remoteCustomType: CustomType<TabsAsArray> | undefined
  mockConfig: any
  initialMockConfig: any
  poolOfFieldsToCheck: TabValueAsArray
  isTouched?: boolean
  __status?: CustomTypeStatus
}

export const CustomTypeState = {
  tab(state: CustomTypeState, tabId?: string): TabAsArray | undefined {
    if(state.current.tabs.length) {
      if(tabId) return state.current.tabs.find(v => v.key === tabId)
      return state.current.tabs[0]
    }
  },

  updateTab(state: CustomTypeState, tabId: string) {
    return (mutate: (v: TabAsArray) => TabAsArray): CustomTypeState => {
      const tabs = state.current.tabs.map(v => {
        if(v.key === tabId) return mutate(v)
        else return v
      })

      return {
        ...state,
        current: {
          ...state.current,
          tabs
        }
      }
    }
  },
  deleteTab(state: CustomTypeState, tabId: string): CustomTypeState {
    const tabs = state.current.tabs.filter(v => v.key !== tabId)
    return {
      ...state,
      current: {
        ...state.current,
        tabs
      }
    }
  },
  getPool(tabs: TabsAsArray):TabValueAsArray {
    return tabs.reduce((acc: TabValueAsArray, curr: TabAsArray) => {
      return [...acc, ...curr.value]
    }, [])
  }
}
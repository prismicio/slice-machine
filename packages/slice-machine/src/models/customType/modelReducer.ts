import { useReducer } from 'react'
import equal from 'fast-deep-equal'
import { CustomType } from '@models/common/CustomType'
import { TabsAsObject, TabsAsArray } from '@models/common/CustomType/tab'
import { CustomTypeState, CustomTypeStatus } from '@models/ui/CustomTypeState'

import reducer from './reducer'
import CustomTypeStore from './store'

export function useModelReducer({ customType, remoteCustomType }: { customType: CustomType<TabsAsObject>, remoteCustomType: CustomType<TabsAsObject> | undefined }): [CustomTypeState, CustomTypeStore] {
  const { id, label, status, repeatable } = customType
  const { tabs } = CustomType.toArray(customType)

  const remoteTabs: TabsAsArray = remoteCustomType ? CustomType.toArray(remoteCustomType).tabs : [] as TabsAsArray

  const __status = (() => {
    if (equal(tabs, remoteTabs)) {
      return CustomTypeStatus.Synced
    }
    return CustomTypeStatus.New
  })()

  const initialState: CustomTypeState = {
    id,
    label,
    status,
    repeatable,
    jsonModel: customType,
    tabs,
    initialTabs: tabs,
    remoteTabs,
    mockConfig: {},
    initialMockConfig: {},
    poolOfFieldsToCheck: CustomTypeState.getPool(tabs),
    __status,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const store = new CustomTypeStore(dispatch)

  return [state, store]
}
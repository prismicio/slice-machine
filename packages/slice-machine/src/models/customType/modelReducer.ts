import { useReducer } from 'react'
import { CustomType } from 'lib/models/common/CustomType'
import { TabsAsObject } from 'lib/models/common/CustomType/tab'
import { CustomTypeState } from 'lib/models/ui/CustomTypeState'

import reducer from './reducer'
import CustomTypeStore from './store'

export function useModelReducer({ customType }: { customType: CustomType<TabsAsObject> }): [CustomTypeState, CustomTypeStore] {
  const { id, title } = customType
  const { tabs } = CustomType.toArray(customType)

  const initialState: CustomTypeState = {
    id,
    title,
    jsonModel: customType,
    tabs,
    initialTabs: tabs,
    mockConfig: {},
    initialMockConfig: {},
    poolOfFieldsToCheck: CustomTypeState.getPool(tabs)
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const store = new CustomTypeStore(dispatch)

  return [state, store]
}
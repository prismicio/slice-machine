import { useReducer } from 'react'
import { LibStatus } from '../../../lib/models/common/Library'
import { CustomType } from '../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../lib/models/common/CustomType/tab'
import { CustomTypeState } from '../../../lib/models/ui/CustomTypeState'

import reducer from './reducer'
import CustomTypeStore from './store'

export function useModelReducer({ customType }: { customType: CustomType<TabsAsObject> }): [CustomTypeState, CustomTypeStore] {
  const { id, label } = customType
  const { tabs } = CustomType.toArray(customType)

  const initialState: CustomTypeState = {
    id,
    label,
    jsonModel: customType,
    tabs,
    initialTabs: tabs,
    mockConfig: {},
    initialMockConfig: {},
    poolOfFieldsToCheck: CustomTypeState.getPool(tabs),
    __status: LibStatus.NewSlice
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const store = new CustomTypeStore(dispatch)

  return [state, store]
}
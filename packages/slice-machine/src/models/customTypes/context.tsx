import React, { useState } from 'react'

import { CustomType } from '../../../lib/models/common/CustomType'
import { CustomTypeState } from '../../../lib/models/ui/CustomTypeState'
import { TabsAsObject } from '../../../lib/models/common/CustomType/tab'

export const CustomTypesContext = React.createContext<Partial<{
  customTypes: Partial<ReadonlyArray<CustomType<TabsAsObject>>>,
  remoteCustomTypes: Partial<ReadonlyArray<CustomType<TabsAsObject>>>,
  onCreate: Function,
  onSave: Function
}>>({ customTypes: [], remoteCustomTypes: [] })

export default function Provider ({ children, customTypes = [], remoteCustomTypes = [] }: {
  children: any,
  customTypes: ReadonlyArray<CustomType<TabsAsObject>> | undefined,
  remoteCustomTypes: ReadonlyArray<CustomType<TabsAsObject>> | undefined,
}) {
  const [cts, setCts] = useState(customTypes)
  const onCreate = (id: string, { label, repeatable }: { label: string, repeatable: boolean }) => {
    setCts([
      {
        id,
        label,
        repeatable,
        tabs: {
          Main: {}
        },
        status: true
      },
      ...cts
    ])
  }

  const onSave = (modelPayload: CustomTypeState) => {
    setCts(cts.map(ct => {
      if (ct.id === modelPayload.current.id) {
        return CustomType.toObject(modelPayload.current)
      }
      return ct
    }))
  }

  return (
    <CustomTypesContext.Provider value={{ customTypes: cts, remoteCustomTypes, onCreate, onSave }}>
      { children }
    </CustomTypesContext.Provider>
  )
}
  

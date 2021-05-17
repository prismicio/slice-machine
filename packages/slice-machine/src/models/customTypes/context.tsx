import React, { useState } from 'react'

import { CustomType } from '../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../lib/models/common/CustomType/tab'

export const CustomTypesContext = React.createContext<{
  customTypes: Partial<ReadonlyArray<CustomType<TabsAsObject>>>,
  remoteCustomTypes: Partial<ReadonlyArray<CustomType<TabsAsObject>>>,
  onCreate?: Function
}>({ customTypes: [], remoteCustomTypes: [] })

export default function Provider ({ children, customTypes = [], remoteCustomTypes = [] }: {
  children: any,
  customTypes: ReadonlyArray<CustomType<TabsAsObject>> | undefined,
  remoteCustomTypes: ReadonlyArray<CustomType<TabsAsObject>> | undefined,
}) {
  const [cts, setCts] = useState(customTypes)

  const onCreate = (id: string, { label, repeatable }: { label: string, repeatable: boolean }) => {
    setCts(cts.map(ct => ({
      ...ct,
      id,
      label,
      repeatable,
      tabs: {
        Main: {}
      }
    })))
  }

  return (
    <CustomTypesContext.Provider value={{ customTypes: cts, remoteCustomTypes, onCreate }}>
      { children }
    </CustomTypesContext.Provider>
  )
}
  
